import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  /**
   * 💬 Enviar mensaje realtime
   */
  @SubscribeMessage('enviarMensaje')
  async handleMessage(
    @MessageBody()
    data: {
      chatId: number;
      remitenteId: number;
      contenido: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const mensaje = await this.chatService.enviarMensaje(
        data.chatId,
        data.remitenteId,
        data.contenido,
      );

      // Emitir a todos en la sala del chat
      this.server
        .to(`chat_${data.chatId}`)
        .emit('nuevoMensaje', mensaje);

      this.server.emit('chatActualizado', {
        chatId: data.chatId,
        mensaje,
      });  

      return mensaje;
    } catch (error) {
      console.error('Error enviando mensaje WS:', error);
    }
  }

  /**
   * 👥 Unirse a sala de chat
   */
  @SubscribeMessage('unirseChat')
  handleJoinChat(
    @MessageBody() data: { chatId: number },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`chat_${data.chatId}`);
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

