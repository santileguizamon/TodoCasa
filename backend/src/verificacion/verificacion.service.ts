import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { TipoNotificacion } from '../common/enums';
import { CreateVerificacionDto } from './dto/create-verificacion.dto';
import { UpdateVerificacionDto } from './dto/update-verificacion.dto';

@Injectable()
export class VerificacionService {
  constructor(
    private prisma: PrismaService,
    private notificacionesService: NotificacionesService,
  ) {}

  // 🧾 Iniciar proceso de verificación (al realizar un pago tipo "VERIFICACION")
  async iniciar(dto: CreateVerificacionDto) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id: dto.usuarioId } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    if (usuario.verificado) throw new BadRequestException('El usuario ya está verificado');

    const verificacion = await this.prisma.verificacion.create({
      data: {
        usuarioId: dto.usuarioId,
        estado: 'PENDIENTE',
        comprobante: dto.comprobante ?? null,
      },
    });

    return { message: 'Verificación iniciada', data: verificacion };
  }

  // ✅ Aprobar verificación (usualmente desde webhook de pagos)
  async aprobar(usuarioId: number) {
    const verificacion = await this.prisma.verificacion.findUnique({ where: { usuarioId } });
    if (!verificacion) throw new NotFoundException('Verificación no encontrada');

    const actualizada = await this.prisma.verificacion.update({
      where: { usuarioId },
      data: {
        estado: 'APROBADA',
        verificadaEn: new Date(),
      },
    });

    await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: { verificado: true },
    });

    await this.notificacionesService.crear({
      usuarioId,
      tipo: TipoNotificacion.OFERTA_ACEPTADA,
      mensaje: 'Tu verificación profesional fue aprobada. ¡Felicitaciones!',
    });

    return { message: 'Verificación aprobada', data: actualizada };
  }

  // ❌ Rechazar verificación (acción manual de admin)
  async rechazar(usuarioId: number, motivo: string) {
    const verificacion = await this.prisma.verificacion.findUnique({ where: { usuarioId } });
    if (!verificacion) throw new NotFoundException('Verificación no encontrada');

    await this.prisma.verificacion.update({
      where: { usuarioId },
      data: {
        estado: 'RECHAZADA',
      },
    });

    await this.notificacionesService.crear({
      usuarioId,
      tipo: TipoNotificacion.TRABAJO_FINALIZADO, // Usando tipo disponible
      mensaje: `Tu verificación profesional fue rechazada. Motivo: ${motivo}`,
    });

    return { message: 'Verificación rechazada correctamente' };
  }

  // 🔍 Consultar todas las verificaciones
  async obtenerTodas() {
    return this.prisma.verificacion.findMany({
      include: { usuario: true },
    });
  }
}

