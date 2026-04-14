import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';
  import { JwtService } from '@nestjs/jwt';
  import { Server, Socket } from 'socket.io';
  import { MensajesService } from './mensajes.service';
  import { CreateMensajeDto } from './dto/create-mensaje.dto';
  
  @WebSocketGateway({
    cors: {
      origin: '*', // ⚠️ Cambiar por el dominio del frontend en producción
    },
  })
  export class MensajesGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    private usuariosConectados = new Map<number, string>(); // userId → socketId
  
    constructor(
      private readonly mensajesService: MensajesService,
      private readonly jwtService: JwtService,
    ) {}
  
    // 🟢 Usuario se conecta
    async handleConnection(socket: Socket) {
      try {
        const token =
          socket.handshake.auth?.token ||
          socket.handshake.headers.authorization?.split(' ')[1];
  
        if (!token) {
          console.warn('❌ Conexión rechazada: token faltante');
          socket.disconnect();
          return;
        }
  
        const payload = await this.jwtService.verifyAsync(token);
        const userId = payload.sub;
  
        this.usuariosConectados.set(userId, socket.id);
        socket.data.userId = userId;
  
        console.log(`✅ Usuario ${userId} conectado (${socket.id})`);
  
        // Notificar a todos que alguien se conectó (opcional)
        this.server.emit('usuario_conectado', { userId });
      } catch (error) {
        console.error('❌ Error de autenticación en socket:', error.message);
        socket.disconnect();
      }
    }
  
    // 🔴 Usuario se desconecta
    handleDisconnect(socket: Socket) {
      const userId = socket.data.userId;
      if (userId) {
        this.usuariosConectados.delete(userId);
        console.log(`🔴 Usuario ${userId} desconectado (${socket.id})`);
        this.server.emit('usuario_desconectado', { userId });
      }
    }
  
    // 💬 Evento: enviar mensaje
    @SubscribeMessage('enviar_mensaje')
    async handleMessage(
      @ConnectedSocket() socket: Socket,
      @MessageBody() dto: CreateMensajeDto,
    ) {
      const remitenteId = socket.data.userId;
      if (!remitenteId) {
        console.warn('⚠️ Usuario no autenticado intentando enviar mensaje');
        return { error: 'No autenticado' };
      }
  
      try {
        // Crear mensaje usando tu servicio real
        const mensaje = await this.mensajesService.enviarMensaje({
          ...dto,
          remitenteId,
        });
  
        // Emitir al destinatario si está conectado
        const destinatarioSocketId = this.usuariosConectados.get(dto.destinatarioId);
        if (destinatarioSocketId) {
          this.server.to(destinatarioSocketId).emit('mensaje_recibido', mensaje);
        }
  
        // Confirmar al remitente
        this.server.to(socket.id).emit('mensaje_enviado', mensaje);
  
        return mensaje;
      } catch (error) {
        console.error('❌ Error al enviar mensaje:', error.message);
        this.server.to(socket.id).emit('error_mensaje', {
          message: 'No se pudo enviar el mensaje',
          error: error.message,
        });
        return { error: error.message };
      }
    }
  
    // 👥 (Opcional) Solicitar lista de usuarios conectados
    @SubscribeMessage('usuarios_conectados')
    handleUsuariosConectados(@ConnectedSocket() socket: Socket) {
      const usuarios = Array.from(this.usuariosConectados.keys());
      this.server.to(socket.id).emit('usuarios_activos', usuarios);
    }
  }
  