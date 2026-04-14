import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ValoracionesService } from './valoraciones.service';
import { CrearValoracionDto } from './dto/crear-valoracion.dto';
import { ActualizarValoracionDto } from './dto/actualizar-valoracion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Rol } from '../common/enums';

@Controller('valoraciones')
export class ValoracionesController {
  constructor(private readonly valoracionesService: ValoracionesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.CLIENTE)
  @Post()
  crear(@Body() dto: CrearValoracionDto, @Req() req) {
    return this.valoracionesService.crear({
      ...dto,
      clienteId: req.user.id,
    });
  }

  @Get('profesional/:profesionalId')
  obtenerPorProfesional(@Param('profesionalId') profesionalId: string) {
    return this.valoracionesService.obtenerPorProfesional(+profesionalId);
  }

  @Get('profesional/:profesionalId/promedio')
  obtenerPromedio(@Param('profesionalId') profesionalId: string) {
    return this.valoracionesService.obtenerPromedio(+profesionalId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.CLIENTE)
  @Get('cliente/mis-valoraciones')
  obtenerPorCliente(@Req() req) {
    return this.valoracionesService.obtenerPorCliente(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.CLIENTE)
  @Patch(':id')
  actualizar(@Param('id') id: string, @Req() req, @Body() dto: ActualizarValoracionDto) {
    return this.valoracionesService.actualizar(+id, req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.CLIENTE)
  @Delete(':id')
  eliminar(@Param('id') id: string, @Req() req) {
    return this.valoracionesService.eliminar(+id, req.user.id);
  }
}
