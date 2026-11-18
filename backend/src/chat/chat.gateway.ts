import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { PrismaService } from '../database/prisma.service';
import { omitSensitiveFields } from '../common/interceptors/omit-sensitive.interceptor';
import { getJwtSecret } from '../auth/jwt.config';

const salaUsuario = (id: number) => `user_${id}`;

@WebSocketGateway({
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private readonly jwt = new JwtService({ secret: getJwtSecret() });

  constructor(
    private readonly chatService: ChatService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * 🔐 Autenticación de la conexión: se exige un JWT válido
   * (handshake.auth.token o cabecera Authorization: Bearer).
   * Sin token o con token inválido, la conexión se rechaza.
   */
  afterInit(server: Server) {
    server.use((socket, next) => {
      try {
        const authHeader = socket.handshake.headers?.authorization;
        const token =
          socket.handshake.auth?.token ||
          (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : undefined);

        if (!token) return next(new Error('No autorizado'));

        const payload: any = this.jwt.verify(token);
        const userId = Number(payload?.userId);
        if (!userId) return next(new Error('No autorizado'));

        socket.data.user = { id: userId, rol: payload.rol };
        socket.join(salaUsuario(userId));
        next();
      } catch {
        next(new Error('No autorizado'));
      }
    });
  }

  private async chatDelUsuario(chatId: number, userId: number) {
    if (!Number.isInteger(chatId) || !userId) return null;
    const chat = await this.prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat) return null;
    if (chat.clienteId !== userId && chat.profesionalId !== userId) return null;
    return chat;
  }

  /**
   * 💬 Enviar mensaje realtime. El remitente es siempre el usuario del socket
   * (se ignora cualquier remitenteId que mande el cliente).
   */
  @SubscribeMessage('enviarMensaje')
  async handleMessage(
    @MessageBody()
    data: {
      chatId: number;
      contenido: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userId: number | undefined = client.data?.user?.id;
      const chatId = Number(data?.chatId);
      const chat = await this.chatDelUsuario(chatId, userId);
      if (!chat) {
        return { error: 'No puedes enviar mensajes en este chat' };
      }

      const mensaje = omitSensitiveFields(
        await this.chatService.enviarMensaje(chatId, userId, data.contenido),
      );

      // Emitir a todos en la sala del chat
      this.server.to(`chat_${chatId}`).emit('nuevoMensaje', mensaje);

      // Avisar solo a los dos participantes (no a todos los conectados)
      this.server
        .to([salaUsuario(chat.clienteId), salaUsuario(chat.profesionalId)])
        .emit('chatActualizado', {
          chatId,
          mensaje,
        });

      return mensaje;
    } catch (error) {
      console.error('Error enviando mensaje WS:', error);
    }
  }

  /**
   * 👥 Unirse a sala de chat (solo cliente o profesional de ese chat)
   */
  @SubscribeMessage('unirseChat')
  async handleJoinChat(
    @MessageBody() data: { chatId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const chatId = Number(data?.chatId);
    const chat = await this.chatDelUsuario(chatId, client.data?.user?.id);
    if (!chat) {
      return { error: 'No puedes unirte a este chat' };
    }
    client.join(`chat_${chatId}`);
    return { ok: true };
  }

  /**
   * 👋 Salir del chat (opcional)
   */
  @SubscribeMessage('salirChat')
  handleLeaveChat(
    @MessageBody() data: { chatId: number },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`chat_${data.chatId}`);
  }
}
