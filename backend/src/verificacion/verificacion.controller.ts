import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { VerificacionService } from './verificacion.service';
import { CreateVerificacionDto } from './dto/create-verificacion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Rol } from '../common/enums';

@Controller('verificacion')
export class VerificacionController {
  constructor(private readonly verificacionService: VerificacionService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.PROFESIONAL)
  @Post()
  iniciar(@Body() dto: CreateVerificacionDto, @Req() req) {
    return this.verificacionService.iniciar({
      ...dto,
      usuarioId: req.user.id,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMIN)
  @Patch(':usuarioId/aprobar')
  aprobar(@Param('usuarioId') usuarioId: string) {
    return this.verificacionService.aprobar(+usuarioId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMIN)
  @Patch(':usuarioId/rechazar')
  rechazar(@Param('usuarioId') usuarioId: string, @Body('motivo') motivo: string) {
    return this.verificacionService.rechazar(+usuarioId, motivo);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMIN)
  @Get()
  obtenerTodas() {
    return this.verificacionService.obtenerTodas();
  }
}
