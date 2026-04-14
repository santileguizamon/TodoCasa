import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { TipoNotificacion } from '@prisma/client';

@Injectable()
export class MensajesService {
  constructor(
    private prisma: PrismaService,
    private notificacionesService: NotificacionesService,
  ) {}

  /**
   * 📩 Crear (enviar) un nuevo mensaje entre cliente y profesional
   */
  async crear(dto: CreateMensajeDto) {
    const remitente = await this.prisma.usuario.findUnique({
      where: { id: dto.remitenteId },
    });
    const destinatario = await this.prisma.usuario.findUnique({
      where: { id: dto.destinatarioId },
    });

    if (!remitente || !destinatario)
      throw new NotFoundException('Uno de los usuarios no existe');

    if (!dto.contenido || dto.contenido.trim() === '')
      throw new BadRequestException('El mensaje no puede estar vacío');

    // ✅ Solo pueden chatear si hay un trabajo ASIGNADO entre ambos
    const trabajoAsociado = await this.prisma.trabajo.findFirst({
      where: {
        estado: 'ASIGNADO',
        clienteId: { in: [dto.remitenteId, dto.destinatarioId] },
        ofertas: {
          some: {
            profesionalId: { in: [dto.remitenteId, dto.destinatarioId] },
          },
        },
      },
      include: {
        ofertas: true,
      },
    });

    if (!trabajoAsociado)
      throw new ForbiddenException('Solo pueden chatear cliente y profesional asignados.');

    // Buscar o crear el chat asociado al trabajo
    let chat = await this.prisma.chat.findUnique({
      where: { trabajoId: trabajoAsociado.id },
    });

    if (!chat) {
      chat = await this.prisma.chat.create({
        data: {
          trabajoId: trabajoAsociado.id,
          clienteId: trabajoAsociado.clienteId,
          profesionalId: trabajoAsociado.ofertas[0]?.profesionalId || dto.destinatarioId,
        },
      });
    }

    // 💬 Crear el mensaje
    const mensaje = await this.prisma.mensaje.create({
      data: {
        chatId: chat.id,
        remitenteId: dto.remitenteId,
        destinatarioId: dto.destinatarioId,
        contenido: dto.contenido,
      },
      include: {
        remitenteUser: { select: { id: true, nombre: true, rol: true } },
        destinatarioUser: { select: { id: true, nombre: true, rol: true } },
      },
    });

    // 🔔 Crear notificación automática
    await this.notificacionesService.crear({
      usuarioId: dto.destinatarioId,
      tipo: TipoNotificacion.NUEVO_MENSAJE,
      mensaje: `Nuevo mensaje de ${remitente.nombre}`,
    });

    return mensaje;
  }

  /**
   * 💬 Obtener historial completo entre dos usuarios
   */
  async obtenerConversacion(usuarioA: number, usuarioB: number) {
    return this.prisma.mensaje.findMany({
      where: {
        OR: [
          { remitenteId: usuarioA, destinatarioId: usuarioB },
          { remitenteId: usuarioB, destinatarioId: usuarioA },
        ],
      },
      orderBy: { enviadoEn: 'asc' },
      include: {
        remitenteUser: { select: { id: true, nombre: true, rol: true } },
        destinatarioUser: { select: { id: true, nombre: true, rol: true } },
      },
    });
  }

  /**
   * 📋 Obtener lista de chats del usuario (último mensaje por contacto)
   */
  async obtenerChatsDeUsuario(usuarioId: number) {
    const mensajes = await this.prisma.mensaje.findMany({
      where: {
        OR: [{ remitenteId: usuarioId }, { destinatarioId: usuarioId }],
      },
      orderBy: { enviadoEn: 'desc' },
      include: {
        remitenteUser: { select: { id: true, nombre: true, rol: true } },
        destinatarioUser: { select: { id: true, nombre: true, rol: true } },
      },
    });

    const chats = new Map<number, any>();
    for (const msg of mensajes) {
      const contactoId = msg.remitenteId === usuarioId ? msg.destinatarioId : msg.remitenteId;
      if (!chats.has(contactoId)) chats.set(contactoId, msg);
    }

    return Array.from(chats.values());
  }

  /**
   * 📩 Enviar mensaje (alias para compatibilidad con gateway)
   */
  async enviarMensaje(dto: CreateMensajeDto) {
    return this.crear(dto);
  }
}
