import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { TipoNotificacion } from '../common/enums';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private notificacionesService: NotificacionesService,
  ) {}

  /**
   * 👥 Obtener todos los usuarios
   */
   obtenerUsuarios() {
    return this.prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        rol: true,
        verificado: true,
        createdAt: true,
        suscripcion: {
          select: {
            nivel: true,
            activa: true,
            fechaFin: true,
          },
        },
        profesional: {
          select: {
            descripcion: true,
            valorHora: true,
          },
        },
        pagos: {
          where: {
            tipo: 'SUSCRIPCION',
            estado: 'PENDIENTE',
            referenciaMP: {
              not: null,
            },
          },
          orderBy: {
            creadoEn: 'desc',
          },
          take: 1,
          select: {
            id: true,
            estado: true,
            monto: true,
            creadoEn: true,
            referenciaMP: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 🚫 SUSPENDER USUARIO
  async suspenderUsuario(id: number, motivo?: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    return this.prisma.usuario.update({
      where: { id },
      data: {
        verificado: false,
      },
    });
  }

  // ✅ REACTIVAR USUARIO
  async reactivarUsuario(id: number) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    return this.prisma.usuario.update({
      where: { id },
      data: {
        verificado: true,
      },
    });
  }

  /**
   * 🧾 Obtener todos los trabajos publicados
   */
  async obtenerTrabajos() {
    return this.prisma.trabajo.findMany({
      include: {
        cliente: { select: { id: true, nombre: true } },
        chat: {
          select: {
            profesional: {
              select: {
                id: true,
                nombre: true,
              },
            },
          },
        },
        ofertas: {
          include: {
            profesional: { 
              include: {
                usuario: { select: { id: true, nombre: true } }
              }
            },
          },
        },
      },
    });
  }

  /**
   * ⚠️ Eliminar trabajo inapropiado
   */
  async eliminarTrabajo(id: number, motivo: string) {
    const trabajo = await this.prisma.trabajo.findUnique({ where: { id } });
    if (!trabajo) throw new NotFoundException('Trabajo no encontrado');

    await this.prisma.trabajo.delete({ where: { id } });

    await this.notificacionesService.crear({
      usuarioId: trabajo.clienteId,
      tipo: TipoNotificacion.TRABAJO_FINALIZADO,
      mensaje: `Tu publicación fue eliminada. Motivo: ${motivo}`,
    });

    return { message: 'Trabajo eliminado correctamente' };
  }

  /**
   * 🚨 Obtener todos los reportes del sistema
   */
  async obtenerReportes() {
    // Nota: El schema no tiene modelo Reporte, se puede implementar si es necesario
    return [];
  }

  /**
   * 📊 Obtener métricas básicas
   */
  async obtenerEstadisticas() {
    const usuarios = await this.prisma.usuario.count();
    const trabajos = await this.prisma.trabajo.count();
    const valoraciones = await this.prisma.valoracion.count();

    return { usuarios, trabajos, valoraciones };
  }

  async rechazarOferta(id: number) {
    const oferta = await this.prisma.oferta.findUnique({
      where: { id },
    });

    if (!oferta) {
      throw new NotFoundException('Oferta no encontrada');
    }

    // Rechazar = eliminar oferta
    return this.prisma.oferta.delete({
      where: { id },
    });
  }

  // 📋 OFERTAS (ADMIN)
  obtenerOfertas() {
    return this.prisma.oferta.findMany({
      include: {
        trabajo: {
          select: {
            id: true,
            titulo: true,
          },
        },
        profesional: {
          select: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { creadaEn: 'desc' },
    });
  }
}

