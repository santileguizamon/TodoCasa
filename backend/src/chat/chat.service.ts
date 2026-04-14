import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async crearChat(clienteId: number, profesionalId: number, trabajoId: number) {
    // Evitar duplicados por trabajo + participantes
    const chatExistente = await this.prisma.chat.findFirst({
      where: {
        trabajoId,
        clienteId,
        profesionalId,
      },
    });

    if (chatExistente) return chatExistente;

    return this.prisma.chat.create({
      data: {
        clienteId,
        profesionalId,
        trabajoId,
      },
    });
  }

  async obtenerChatsPorUsuario(usuarioId: number, soloArchivados = false) {
    return this.prisma.chat.findMany({
      where: {
        OR: [
          { clienteId: usuarioId },
          { profesionalId: usuarioId },
        ],
        AND: [
          {
            OR: [
              {
                clienteId: usuarioId,
                archivadoCliente: soloArchivados,
              },
              {
                profesionalId: usuarioId,
                archivadoProfesional: soloArchivados,
              },
            ],
          },
        ],
      },
      include: {
        trabajo: true,
        cliente: true,
        profesional: true,
        mensajes: {
          orderBy: { enviadoEn: 'desc' },
          take: 1, // ultimo mensaje
        },
        _count: {
          select: {
            mensajes: {
              where: {
                destinatarioId: usuarioId,
                leido: false,
              },
            },
          },
        },
      },
    });
  }

  async enviarMensaje(chatId: number, remitenteId: number, contenido: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) throw new NotFoundException('Chat no encontrado');

    // Validar remitente pertenece al chat
    if (chat.clienteId !== remitenteId && chat.profesionalId !== remitenteId) {
      throw new ForbiddenException('No puedes enviar mensajes en este chat');
    }

    // Determinar destinatario
    const destinatarioId =
      chat.clienteId === remitenteId
        ? chat.profesionalId
        : chat.clienteId;

    const mensaje = await this.prisma.mensaje.create({
      data: {
        chatId,
        remitenteId,
        destinatarioId,
        contenido,
      },
    });

    return mensaje;
  }

  async obtenerMensajes(chatId: number) {
    return this.prisma.mensaje.findMany({
      where: { chatId },
      orderBy: { enviadoEn: 'asc' },
    });
  }

  async marcarComoLeido(mensajeId: number) {
    return this.prisma.mensaje.update({
      where: { id: mensajeId },
      data: { leido: true },
    });
  }

  async obtenerChatPorTrabajo(trabajoId: number, userId: number) {
    return this.prisma.chat.findFirst({
      where: {
        trabajoId,
        OR: [
          { clienteId: userId },
          { profesionalId: userId },
        ],
      },
      include: {
        trabajo: true,
        cliente: true,
        profesional: true,
      },
    });
  }

  async marcarChatLeido(chatId: number, userId: number) {
    return this.prisma.mensaje.updateMany({
      where: {
        chatId,
        destinatarioId: userId,
        leido: false,
      },
      data: {
        leido: true,
      },
    });
  }

  async contarNoLeidos(usuarioId: number) {
    return this.prisma.mensaje.groupBy({
      by: ['chatId'],
      where: {
        remitenteId: { not: usuarioId },
        leido: false,
      },
      _count: {
        _all: true,
      },
    });
  }

  async archivarChat(chatId: number, userId: number) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) throw new NotFoundException('Chat no encontrado');

    if (chat.clienteId !== userId && chat.profesionalId !== userId) {
      throw new ForbiddenException('No puedes archivar este chat');
    }

    const data =
      chat.clienteId === userId
        ? { archivadoCliente: true }
        : { archivadoProfesional: true };

    return this.prisma.chat.update({
      where: { id: chatId },
      data,
    });
  }

  async restaurarChat(chatId: number, userId: number) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) throw new NotFoundException('Chat no encontrado');

    if (chat.clienteId !== userId && chat.profesionalId !== userId) {
      throw new ForbiddenException('No puedes restaurar este chat');
    }

    const data =
      chat.clienteId === userId
        ? { archivadoCliente: false }
        : { archivadoProfesional: false };

    return this.prisma.chat.update({
      where: { id: chatId },
      data,
    });
  }
}
