import { Controller, Post, Get, Body, Param, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { MensajesService } from './mensajes.service';
import { CreateMensajeDto } from './dto/create-mensaje.dto';

@Controller('mensajes')
export class MensajesController {
  constructor(private readonly mensajesService: MensajesService) {}

  /**
   * 📩 Crear (enviar) un nuevo mensaje
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crear(@Body() dto: CreateMensajeDto) {
    const mensaje = await this.mensajesService.crear(dto);
    return {
      message: 'Mensaje enviado con éxito',
      data: mensaje,
    };
  }

  /**
   * 💬 Obtener conversación completa entre dos usuarios
   */
  @Get('conversacion/:usuarioA/:usuarioB')
  async obtenerConversacion(
    @Param('usuarioA', ParseIntPipe) usuarioA: number,
    @Param('usuarioB', ParseIntPipe) usuarioB: number,
  ) {
    const mensajes = await this.mensajesService.obtenerConversacion(usuarioA, usuarioB);
    return {
      message: 'Conversación obtenida con éxito',
      data: mensajes,
    };
  }

  /**
   * 📋 Listar todos los chats del usuario (último mensaje por contacto)
   */
  @Get('usuario/:id')
  async obtenerChatsDeUsuario(@Param('id', ParseIntPipe) usuarioId: number) {
    const chats = await this.mensajesService.obtenerChatsDeUsuario(usuarioId);
    return {
      message: 'Listado de chats obtenido con éxito',
      data: chats,
    };
  }
}

