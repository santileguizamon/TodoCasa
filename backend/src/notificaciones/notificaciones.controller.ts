import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { CreateNotificacioneDto } from './dto/create-notificacione.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Rol } from '../common/enums';

@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMIN)
  @Post()
  crear(@Body() dto: CreateNotificacioneDto) {
    return this.notificacionesService.crear(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('usuario/:id')
  obtenerPorUsuario(@Param('id', ParseIntPipe) id: number, @Req() req) {
    if (req.user.rol !== Rol.ADMIN && req.user.id !== id) {
      throw new ForbiddenException('No tienes permiso para ver estas notificaciones');
    }
    return this.notificacionesService.obtenerPorUsuario(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/leida')
  async marcarComoLeida(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const propias = await this.notificacionesService.obtenerPorUsuario(req.user.id);
    const esPropia = propias.some((n) => n.id === id);
    if (req.user.rol !== Rol.ADMIN && !esPropia) {
      throw new ForbiddenException('No puedes modificar notificaciones de otro usuario');
    }
    return this.notificacionesService.marcarComoLeida(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async eliminar(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const propias = await this.notificacionesService.obtenerPorUsuario(req.user.id);
    const esPropia = propias.some((n) => n.id === id);
    if (req.user.rol !== Rol.ADMIN && !esPropia) {
      throw new ForbiddenException('No puedes eliminar notificaciones de otro usuario');
    }
    return this.notificacionesService.eliminar(id);
  }
}
