import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CrearTrabajoDto } from './dto/crear-trabajo.dto';
import { ActualizarTrabajoDto } from './dto/actualizar-trabajo.dto';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { EstadoTrabajo, TipoNotificacion, Rol } from '@prisma/client';
import { GeocodingService } from '../common/services/geocoding.service';

@Injectable()
export class TrabajosService {
  private readonly logger = new Logger(TrabajosService.name);

  constructor(
    private prisma: PrismaService,
    private notificacionesService: NotificacionesService,
    private geocoding: GeocodingService,
  ) {}

  // ✅ Crear trabajo
  async crear(dto: CrearTrabajoDto) {
    const cliente = await this.prisma.usuario.findUnique({
      where: { id: dto.clienteId },
    });

    if (!cliente) throw new NotFoundException('Cliente no encontrado');

    if (cliente.rol !== Rol.CLIENTE)
      throw new ForbiddenException('Solo clientes pueden crear trabajos');

    if (dto.rangoMin > dto.rangoMax)
      throw new BadRequestException('Rango de precios inválido');

    // Priorizamos coordenadas del frontend (GPS). Si no existen,
    // intentamos geocodificar direccion y como fallback usamos
    // la ubicacion ya guardada del cliente.
    let lat: number | null = dto.lat ?? null;
    let lng: number | null = dto.lng ?? null;

    if (lat == null || lng == null) {
      if (dto.direccion) {
        try {
          const geocoded = await this.geocoding.geocode(dto.direccion);
          lat = geocoded.lat;
          lng = geocoded.lng;
        } catch (error: any) {
          this.logger.warn(
            `No se pudo geocodificar direccion "${dto.direccion}": ${error?.message ?? error}`,
          );
        }
      }
    }

    if ((lat == null || lng == null) && cliente.lat != null && cliente.lng != null) {
      lat = cliente.lat;
      lng = cliente.lng;
    }

    if (lat == null || lng == null) {
      throw new BadRequestException(
        'No se pudo determinar la ubicacion del trabajo. Habilita GPS o ingresa una direccion valida.',
      );
    }

    const data: any = {
      clienteId: dto.clienteId,
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      rangoMin: dto.rangoMin,
      rangoMax: dto.rangoMax,
      urgente: dto.urgente ?? false,
      lat,
      lng,
      radioKm: dto.radioKm ?? 10,
      direccion: dto.direccion,
      categoria: dto.categoria,
    };

    if (dto.urgente) {
      data.expiraEn = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    let trabajo: any;
    try {
      trabajo = await this.prisma.trabajo.create({ data });
    } catch (error: any) {
      if (error?.code === 'P2022' || String(error?.message || '').includes('categoria')) {
        const fallbackData = { ...data };
        delete fallbackData.categoria;
        trabajo = await this.prisma.trabajo.create({ data: fallbackData });
      } else {
        throw error;
      }
    }

    await this.notificarProfesionalesCercanos(lat, lng, dto.titulo);

    return trabajo;
  }

// 📋 Trabajos disponibles
  async obtenerDisponibles(soloUrgentes?: boolean, categoria?: string) {
    const trabajos = await this.prisma.trabajo.findMany({
      where: {
        estado: EstadoTrabajo.PENDIENTE,
        ...(soloUrgentes ? { urgente: true } : {}),
      },
      include: { cliente: true, ofertas: true },
    });

    if (!categoria) return trabajos;
    const target = categoria.toLowerCase();
    return trabajos.filter((t: any) =>
      String(t?.categoria || '').toLowerCase().includes(target),
    );
  }

  // 🌍 Por ubicación
  async obtenerPorUbicacion(
    lat: number,
    lng: number,
    radioKm = 15,
    soloUrgentes?: boolean,
    categoria?: string,
  ) {
    const trabajos = await this.prisma.trabajo.findMany({
      where: {
        estado: EstadoTrabajo.PENDIENTE,
        ...(soloUrgentes ? { urgente: true } : {}),
        lat: { not: null },
        lng: { not: null },
      },
      include: { cliente: true },
    });

    const filtradosPorDistancia = trabajos.filter(
      (t) => this.distanciaKm(lat, lng, t.lat!, t.lng!) <= (t.radioKm ?? radioKm),
    );

    if (!categoria) return filtradosPorDistancia;
    const target = categoria.toLowerCase();
    return filtradosPorDistancia.filter((t: any) =>
      String(t?.categoria || '').toLowerCase().includes(target),
    );
  }

  // 📡 Notificaciones
  private async notificarProfesionalesCercanos(
    lat: number,
    lng: number,
    titulo: string,
  ) {
    const profesionales = await this.prisma.usuario.findMany({
      where: {
        rol: Rol.PROFESIONAL,
        lat: { not: null },
        lng: { not: null },
      },
    });

    const radio = 15;

    const cercanos = profesionales.filter(
      (p) => this.distanciaKm(lat, lng, p.lat!, p.lng!) <= radio,
    );

    for (const p of cercanos) {
      await this.notificacionesService.crear({
        usuarioId: p.id,
        tipo: TipoNotificacion.OFERTA_ACEPTADA,
        mensaje: `Nuevo trabajo disponible cerca: ${titulo}`,
      });
    }
  }

  private distanciaKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private toRad(value: number) {
    return (value * Math.PI) / 180;
  }

  // 📋 Por cliente
  async obtenerPorCliente(clienteId: number) {
    return this.prisma.trabajo.findMany({
      where: { clienteId },
      include: { ofertas: true, valoracion: true },
    });
  }

  async obtenerPorProfesional(profesionalId: number) {
    return this.prisma.trabajo.findMany({
      where: {
        ofertas: {
          some: {
            profesionalId,
          },
        },
      },
      include: { ofertas: true, cliente: true, valoracion: true },
      orderBy: { creadoEn: 'desc' },
    });
  }

  // 🔎 Uno
  async obtenerUno(id: number) {
    const trabajo = await this.prisma.trabajo.findUnique({
      where: { id },
      include: { cliente: true, ofertas: true, valoracion: true, chat: true },
    });
    if (!trabajo) throw new NotFoundException('Trabajo no encontrado');
    return trabajo;
  }

  // ✏️ Actualizar
  async actualizar(id: number, clienteId: number, dto: ActualizarTrabajoDto) {
    const trabajo = await this.prisma.trabajo.findUnique({ where: { id } });

    if (!trabajo || trabajo.clienteId !== clienteId)
      throw new ForbiddenException('No puedes editar este trabajo');

    return this.prisma.trabajo.update({
      where: { id },
      data: dto,
    });
  }

  // 🔄 Cambiar estado
  async cambiarEstado(id: number, estado: EstadoTrabajo) {
    const trabajo = await this.prisma.trabajo.findUnique({ where: { id } });
    if (!trabajo) throw new NotFoundException('Trabajo no encontrado');

    return this.prisma.trabajo.update({
      where: { id },
      data: { estado },
    });
  }

  // 🗑️ Eliminar
  async eliminar(id: number, clienteId: number) {
    const trabajo = await this.prisma.trabajo.findUnique({ where: { id } });

    if (!trabajo) throw new NotFoundException('Trabajo no encontrado');
    if (trabajo.clienteId !== clienteId)
      throw new ForbiddenException('No puedes eliminar este trabajo');
    if (trabajo.estado === EstadoTrabajo.ASIGNADO)
      throw new ForbiddenException('Trabajo asignado no puede eliminarse');

    return this.prisma.trabajo.delete({ where: { id } });
  }

  // ✅ Cliente confirma finalización
  async clienteConfirmaFinalizacion(trabajoId: number, clienteId: number) {
    const trabajo = await this.prisma.trabajo.findUnique({
      where: { id: trabajoId },
      include: { ofertas: true },
    });

    if (!trabajo) throw new NotFoundException('Trabajo no encontrado');
    if (trabajo.clienteId !== clienteId)
      throw new ForbiddenException('No sos el dueño');

    const oferta = trabajo.ofertas[0];
    if (!oferta) throw new BadRequestException('No hay profesional asignado');

    await this.prisma.trabajo.update({
      where: { id: trabajoId },
      data: {
        estado: EstadoTrabajo.FINALIZADO,
        fechaFin: new Date(),
      },
    });

    await this.notificacionesService.crear({
      usuarioId: oferta.profesionalId,
      tipo: TipoNotificacion.TRABAJO_FINALIZADO,
      mensaje: `El trabajo "${trabajo.titulo}" fue finalizado.`,
    });

    return { ok: true };
  }

  // ⏰ Auto confirmación
  async autoConfirmarTrabajosVencidos() {
    const limite = new Date(Date.now() - 72 * 60 * 60 * 1000);

    const trabajos = await this.prisma.trabajo.findMany({
      where: {
        estado: EstadoTrabajo.ASIGNADO,
        fechaAcordada: { lte: limite },
      },
      include: { ofertas: true },
    });

    for (const t of trabajos) {
      await this.prisma.trabajo.update({
        where: { id: t.id },
        data: {
          estado: EstadoTrabajo.FINALIZADO,
          fechaFin: new Date(),
        },
      });

      if (t.ofertas[0]) {
        await this.notificacionesService.crear({
          usuarioId: t.ofertas[0].profesionalId,
          tipo: TipoNotificacion.TRABAJO_FINALIZADO,
          mensaje: `El trabajo "${t.titulo}" se finalizó automáticamente.`,
        });
      }
    }

    return { total: trabajos.length };
  }

  // ❌ Cancelar
  async cancelarTrabajo(trabajoId: number, usuarioId: number) {
    const trabajo = await this.prisma.trabajo.findUnique({
      where: { id: trabajoId },
    });

    if (!trabajo) throw new NotFoundException('Trabajo no encontrado');

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    if (usuario.rol !== Rol.ADMIN && trabajo.clienteId !== usuarioId)
      throw new ForbiddenException('No puedes cancelar este trabajo');

    return this.prisma.trabajo.update({
      where: { id: trabajoId },
      data: { estado: EstadoTrabajo.CANCELADO },
    });
  }

  // 📅 Definir fecha acordada
  async definirFechaAcordada(
    trabajoId: number,
    clienteId: number,
    fecha: Date,
  ) {
    const trabajo = await this.prisma.trabajo.findUnique({
      where: { id: trabajoId },
    });

    if (!trabajo) throw new NotFoundException('Trabajo no encontrado');
    if (trabajo.clienteId !== clienteId)
      throw new ForbiddenException('No sos el dueño');
    if (trabajo.estado !== EstadoTrabajo.ASIGNADO)
      throw new BadRequestException('Trabajo no asignado');

    return this.prisma.trabajo.update({
      where: { id: trabajoId },
      data: { fechaAcordada: fecha },
    });
  }

  // ⭐ Puede valorar
  async puedeValorar(trabajoId: number, clienteId: number) {
    const trabajo = await this.prisma.trabajo.findUnique({
      where: { id: trabajoId },
      include: { valoracion: true },
    });

    if (!trabajo) throw new NotFoundException('Trabajo no encontrado');
    if (trabajo.clienteId !== clienteId)
      throw new ForbiddenException('No sos el dueño');

    return {
      puedeValorar:
        trabajo.estado === EstadoTrabajo.FINALIZADO &&
        trabajo.valoracion === null,
    };
  }

  async profesionalMarcaTerminado(trabajoId: number, profesionalId: number) {
  const trabajo = await this.prisma.trabajo.findUnique({
    where: { id: trabajoId },
    include: { ofertas: true },
  });

  if (!trabajo) {
    throw new NotFoundException('Trabajo no encontrado');
  }

  if (trabajo.estado !== EstadoTrabajo.ASIGNADO) {
    throw new BadRequestException(
      'El trabajo no está en estado ASIGNADO',
    );
  }

  // validar que el profesional sea el asignado
  const ofertaAceptada = trabajo.ofertas.find(
    (o) => o.profesionalId === profesionalId,
  );

  if (!ofertaAceptada) {
    throw new ForbiddenException(
      'No sos el profesional asignado a este trabajo',
    );
  }

  return this.prisma.trabajo.update({
    where: { id: trabajoId },
    data: {
      estado: EstadoTrabajo.PENDIENTE_CONFIRMACION,
    },
  });
}
}



