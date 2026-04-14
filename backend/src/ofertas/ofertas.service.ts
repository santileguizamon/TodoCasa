import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CrearOfertaDto } from './dto/crear-oferta.dto';
import { TipoNotificacion } from '@prisma/client';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

@Injectable()
export class OfertasService {
  private static readonly URGENTE_MULTIPLIER = 1.5;

  constructor(
    private prisma: PrismaService,
    private notificacionesService: NotificacionesService,
  ) { }

  /**
   * 📦 Crear nueva oferta
   * Solo los profesionales con suscripción activa pueden ofertar.
   */
  async crear(dto: CrearOfertaDto) {
    const profesional = await this.prisma.usuario.findUnique({
      where: { id: dto.profesionalId },
      include: { suscripcion: true },
    });

    if (!profesional) throw new NotFoundException('Profesional no encontrado');
    if (profesional.rol !== 'PROFESIONAL')
      throw new ForbiddenException('Solo los profesionales pueden ofertar');

    const suscripcion = profesional.suscripcion;

    if (!suscripcion) {
      throw new ForbiddenException(
        'Debe tener una suscripción activa para ofertar',
      );
    }

    const estaActiva =
      suscripcion.activa &&
      (!suscripcion.fechaFin ||
        suscripcion.fechaFin > new Date());

    if (!estaActiva) {
      throw new ForbiddenException(
        'Tu suscripción está vencida. Debes renovarla para ofertar.',
      );
    }

    const trabajo = await this.prisma.trabajo.findUnique({
      where: { id: dto.trabajoId },
    });

    if (!trabajo) throw new NotFoundException('Trabajo no encontrado');
    if (trabajo.estado !== 'PENDIENTE')
      throw new ForbiddenException('No se puede ofertar sobre un trabajo asignado o cerrado');
    if (dto.monto < trabajo.rangoMin || dto.monto > trabajo.rangoMax) {
      throw new BadRequestException(
        `El monto debe estar entre ${trabajo.rangoMin} y ${trabajo.rangoMax}`,
      );
    }

    return this.prisma.oferta.create({
      data: {
        trabajoId: dto.trabajoId,
        profesionalId: dto.profesionalId,
        monto: dto.monto,
      },
    });
  }

  /**
   * 📋 Obtener todas las ofertas de un trabajo
   */
  async obtenerPorTrabajo(trabajoId: number) {
    return this.prisma.oferta.findMany({
      where: { trabajoId },
      include: { profesional: true },
    });
  }

  async obtenerMiOfertaPorTrabajo(trabajoId: number, profesionalId: number) {
    const oferta = await this.prisma.oferta.findFirst({
      where: {
        trabajoId,
        profesionalId,
      },
    });

    if (!oferta) return null;

    const chat = await this.prisma.chat.findUnique({
      where: { trabajoId },
      select: { profesionalId: true },
    });

    return {
      ...oferta,
      fueAceptada: chat?.profesionalId === profesionalId,
    };
  }

  /**
   * 🗑️ Eliminar una oferta
   * Solo el profesional que la creó puede eliminarla.
   */
  async eliminar(id: number, profesionalId: number) {
    const oferta = await this.prisma.oferta.findUnique({ where: { id } });

    if (!oferta) throw new NotFoundException('Oferta no encontrada');
    if (oferta.profesionalId !== profesionalId)
      throw new ForbiddenException('No puede eliminar una oferta que no es suya');

    return this.prisma.oferta.delete({ where: { id } });
  }

  /**
   * ✅ Aceptar una oferta (cliente)
   * Cambia el estado del trabajo, guarda fechaAsignado, rechaza otras ofertas y habilita el chat.
   */
  async aceptarOferta(ofertaId: number, clienteId?: number) {
    const oferta = await this.prisma.oferta.findUnique({
      where: { id: ofertaId },
      include: { trabajo: true, profesional: true },
    });

    if (!oferta) throw new NotFoundException('Oferta no encontrada');
    if (clienteId && oferta.trabajo.clienteId !== clienteId)
      throw new ForbiddenException('No puedes aceptar una oferta de otro cliente');

    if (oferta.trabajo.estado !== 'PENDIENTE')
      throw new ForbiddenException('El trabajo ya fue asignado o finalizado');

    const montoBase = Number(oferta.monto);
    const factorUrgencia = oferta.trabajo.urgente
      ? OfertasService.URGENTE_MULTIPLIER
      : 1;
    const montoFinal = Number((montoBase * factorUrgencia).toFixed(2));

    // Transacción: actualizar trabajo a ASIGNADO
    await this.prisma.trabajo.update({
      where: { id: oferta.trabajoId },
      data: {
        estado: 'ASIGNADO',
      },
    });

    // Crear o habilitar el chat si no existe
    let chat = await this.prisma.chat.findUnique({
      where: { trabajoId: oferta.trabajoId },
    });

    if (!chat) {
      chat = await this.prisma.chat.create({
        data: {
          trabajoId: oferta.trabajoId,
          clienteId: oferta.trabajo.clienteId,
          profesionalId: oferta.profesionalId,
        },
      });
    }

    // Notificar al profesional
    await this.notificacionesService.crear({
      usuarioId: oferta.profesionalId,
      tipo: TipoNotificacion.OFERTA_ACEPTADA,
      mensaje: `Tu oferta para "${oferta.trabajo.titulo}" fue aceptada. Monto final: $${montoFinal}.`,
    });

    return {
      message: 'Oferta aceptada, trabajo asignado y chat habilitado.',
      trabajoId: oferta.trabajoId,
      profesionalId: oferta.profesionalId,
      montoBase,
      factorUrgencia,
      montoFinal,
    };
  }
}
