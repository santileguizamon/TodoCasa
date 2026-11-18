import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { MensajesService } from './mensajes.service';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Rol } from '../common/enums';

@Controller('mensajes')
@UseGuards(JwtAuthGuard)
export class MensajesController {
  constructor(private readonly mensajesService: MensajesService) {}

  /**
   * 📩 Crear (enviar) un nuevo mensaje. El remitente es siempre el usuario autenticado.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crear(@Body() dto: CreateMensajeDto, @Req() req) {
    const mensaje = await this.mensajesService.crear({
      ...dto,
      remitenteId: req.user.id,
    });
    return {
      message: 'Mensaje enviado con éxito',
      data: mensaje,
    };
  }

  /**
   * 💬 Obtener conversación completa entre dos usuarios (solo participantes o ADMIN)
   */
  @Get('conversacion/:usuarioA/:usuarioB')
  async obtenerConversacion(
    @Param('usuarioA', ParseIntPipe) usuarioA: number,
    @Param('usuarioB', ParseIntPipe) usuarioB: number,
    @Req() req,
  ) {
    if (
      req.user.rol !== Rol.ADMIN &&
      req.user.id !== usuarioA &&
      req.user.id !== usuarioB
    ) {
      throw new ForbiddenException('No podés ver esta conversación');
    }
    const mensajes = await this.mensajesService.obtenerConversacion(usuarioA, usuarioB);
    return {
      message: 'Conversación obtenida con éxito',
      data: mensajes,
    };
  }

  /**
   * 📋 Listar todos los chats del usuario (solo el propio usuario o ADMIN)
   */
  @Get('usuario/:id')
  async obtenerChatsDeUsuario(
    @Param('id', ParseIntPipe) usuarioId: number,
    @Req() req,
  ) {
    if (req.user.rol !== Rol.ADMIN && req.user.id !== usuarioId) {
      throw new ForbiddenException('No podés ver los chats de otro usuario');
    }
    const chats = await this.mensajesService.obtenerChatsDeUsuario(usuarioId);
    return {
      message: 'Listado de chats obtenido con éxito',
      data: chats,
    };
  }
}
