import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CrearSuscripcionDto } from './dto/crear-suscripcion.dto';
import { ActualizarSuscripcionDto } from './dto/actualizar-suscripcion.dto';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { TipoNotificacion } from '../common/enums';

@Injectable()
export class SuscripcionesService {
  constructor(
    private prisma: PrismaService,
    private notificacionesService: NotificacionesService,
  ) {}

  // 📅 Crear una nueva suscripción
  async crear(dto: CrearSuscripcionDto) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id: dto.usuarioId } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const existente = await this.prisma.suscripcion.findUnique({
      where: { usuarioId: dto.usuarioId },
    });

    if (existente && existente.activa)
      throw new BadRequestException('El usuario ya tiene una suscripción activa');

    const suscripcion = await this.prisma.suscripcion.create({
      data: {
        usuarioId: dto.usuarioId,
        nivel: dto.nivel,
        activa: true,
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días por defecto
      },
    });

    // 🔔 Notificar activación
    await this.notificacionesService.crear({
      usuarioId: dto.usuarioId,
      tipo: TipoNotificacion.SUSCRIPCION_POR_VENCER,
      mensaje: `Tu suscripción (${dto.nivel}) ha sido activada con éxito.`,
    });

    return { message: 'Suscripción creada con éxito', data: suscripcion };
  }

  // 📋 Obtener todas las suscripciones
  async obtenerTodas() {
    return this.prisma.suscripcion.findMany({
      include: { usuario: true },
    });
  }

  // 📋 Obtener una suscripción por ID
  async obtenerUna(id: number) {
    const suscripcion = await this.prisma.suscripcion.findUnique({
      where: { id },
      include: { usuario: true },
    });
    if (!suscripcion) throw new NotFoundException('Suscripción no encontrada');
    return suscripcion;
  }

  // ❌ Cancelar suscripción
  async cancelar(id: number) {
    const suscripcion = await this.prisma.suscripcion.findUnique({ where: { id } });
    if (!suscripcion) throw new NotFoundException('Suscripción no encontrada');

    return this.prisma.suscripcion.update({
      where: { id },
      data: { activa: false },
    });
  }

  // ♻️ Actualizar o renovar suscripción
  async actualizar(id: number, dto: ActualizarSuscripcionDto) {
    const suscripcion = await this.prisma.suscripcion.findUnique({ where: { id } });
    if (!suscripcion) throw new NotFoundException('Suscripción no encontrada');

    const actualizada = await this.prisma.suscripcion.update({
      where: { id },
      data: {
        nivel: dto.nivel ?? suscripcion.nivel,
        activa: dto.activa ?? suscripcion.activa,
        fechaFin: dto.fechaFin ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // 🔔 Notificar renovación/actualización (reutilizamos tipo "POR_VENCER" para consistencia)
    await this.notificacionesService.crear({
      usuarioId: actualizada.usuarioId,
      tipo: TipoNotificacion.SUSCRIPCION_POR_VENCER,
      mensaje: `Tu suscripción ha sido renovada. Nueva fecha de vencimiento: ${actualizada.fechaFin.toLocaleDateString()}.`,
    });

    return { message: 'Suscripción actualizada con éxito', data: actualizada };
  }

  // ⏰ Revisar suscripciones por vencer (ej. llamada por cron job diario)
  async verificarProximosVencimientos() {
    const hoy = new Date();
    const tresDiasDespues = new Date(hoy.getTime() + 3 * 24 * 60 * 60 * 1000);

    const suscripcionesPorVencer = await this.prisma.suscripcion.findMany({
      where: {
        activa: true,
        fechaFin: {
          gte: hoy,
          lte: tresDiasDespues,
        },
      },
      include: { usuario: true },
    });

    for (const s of suscripcionesPorVencer) {
      await this.notificacionesService.crear({
        usuarioId: s.usuarioId,
        tipo: TipoNotificacion.SUSCRIPCION_POR_VENCER,
        mensaje: `Tu suscripción (${s.nivel}) vencerá el ${s.fechaFin.toLocaleDateString()}. ¡Renovala a tiempo!`,
      });
    }

    return { total: suscripcionesPorVencer.length, message: 'Notificaciones de vencimiento enviadas.' };
  }
}

