import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateNotificacioneDto } from './dto/create-notificacione.dto';

@Injectable()
export class NotificacionesService {
  constructor(private prisma: PrismaService) {}

  /**
   * 📢 Crear una nueva notificación
   */
  async crear(dto: CreateNotificacioneDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: dto.usuarioId },
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    return this.prisma.notificacion.create({
      data: {
        usuarioId: dto.usuarioId,
        tipo: dto.tipo,
        mensaje: dto.mensaje,
        leida: dto.leida ?? false,
        trabajoId: dto.trabajoId ?? null,
      },
    });
  }

  /**
   * 📬 Obtener todas las notificaciones de un usuario
   */
  async obtenerPorUsuario(usuarioId: number) {
    return this.prisma.notificacion.findMany({
      where: { usuarioId },
      orderBy: { creadaEn: 'desc' },
    });
  }

  /**
   * ✅ Marcar una notificación como leída
   */
  async marcarComoLeida(id: number) {
    const notificacion = await this.prisma.notificacion.findUnique({
      where: { id },
    });
    if (!notificacion) throw new NotFoundException('Notificación no encontrada');

    return this.prisma.notificacion.update({
      where: { id },
      data: { leida: true },
    });
  }

  /**
   * ❌ Eliminar una notificación
   */
  async eliminar(id: number) {
    return this.prisma.notificacion.delete({ where: { id } });
  }
}
