import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ProfesionalActivoChatGuard } from '@/common/guards/profesional-activo-chat.guard';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  crearChat(
    @Body('clienteId', ParseIntPipe) clienteId: number,
    @Body('profesionalId', ParseIntPipe) profesionalId: number,
    @Body('trabajoId', ParseIntPipe) trabajoId: number,
  ) {
    return this.chatService.crearChat(clienteId, profesionalId, trabajoId);
  }

  @Get()
  obtenerChats(@Req() req, @Query('archivados') archivados?: string) {
    const soloArchivados = archivados === 'true';
    return this.chatService.obtenerChatsPorUsuario(req.user.id, soloArchivados);
  }

  /**
   * Enviar mensaje
   * - Cliente: siempre permitido
   * - Profesional: solo con suscripcion activa
   */
  @UseGuards(ProfesionalActivoChatGuard)
  @Post(':chatId/mensaje')
  enviarMensaje(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Body('contenido') contenido: string,
    @Req() req,
  ) {
    return this.chatService.enviarMensaje(
      chatId,
      req.user.id,
      contenido,
    );
  }

  @Get(':chatId/mensajes')
  obtenerMensajes(@Param('chatId', ParseIntPipe) chatId: number) {
    return this.chatService.obtenerMensajes(chatId);
  }

  @Get('trabajo/:trabajoId')
  obtenerChatPorTrabajo(
    @Param('trabajoId', ParseIntPipe) trabajoId: number,
    @Req() req,
  ) {
    return this.chatService.obtenerChatPorTrabajo(
      trabajoId,
      req.user.id,
    );
  }

  @Post(':chatId/leer')
  marcarLeidos(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Req() req,
  ) {
    return this.chatService.marcarChatLeido(chatId, req.user.id);
  }

  @Post(':chatId/archivar')
  archivarChat(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Req() req,
  ) {
    return this.chatService.archivarChat(chatId, req.user.id);
  }

  @Post(':chatId/restaurar')
  restaurarChat(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Req() req,
  ) {
    return this.chatService.restaurarChat(chatId, req.user.id);
  }

  @Get('no-leidos')
  getNoLeidos(@Req() req) {
    return this.chatService.contarNoLeidos(req.user.id);
  }

}
