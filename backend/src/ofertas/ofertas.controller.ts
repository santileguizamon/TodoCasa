import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OfertasService } from './ofertas.service';
import { CrearOfertaDto } from './dto/crear-oferta.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Rol } from 'src/common/enums';
import { ProfesionalActivoGuard } from   'src/common/guards/profesional-activo.guard';
import { ProfesionalVerificadoGuard } from 'src/common/guards/profesional-verificado.guard';

@Controller('ofertas')
export class OfertasController {
  constructor(private readonly ofertasService: OfertasService) {}

  /**
   * 📦 Crear oferta (solo profesional habilitado)
   */
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
    ProfesionalActivoGuard,
    ProfesionalVerificadoGuard,
  )
  @Roles(Rol.PROFESIONAL)
  @Post()
  crearOferta(@Body() dto: CrearOfertaDto, @Req() req) {
    return this.ofertasService.crear({
      ...dto,
      profesionalId: req.user.id,
    });
  }

  /**
   * 📋 Ofertas por trabajo
   */
  @UseGuards(JwtAuthGuard)
  @Get('trabajo/:id')
  obtenerPorTrabajo(@Param('id', ParseIntPipe) trabajoId: number) {
    return this.ofertasService.obtenerPorTrabajo(trabajoId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.PROFESIONAL)
  @Get('mi-oferta/:trabajoId')
  obtenerMiOferta(
    @Param('trabajoId', ParseIntPipe) trabajoId: number,
    @Req() req,
  ) {
    return this.ofertasService.obtenerMiOfertaPorTrabajo(
      trabajoId,
      req.user.id,
    );
  }

  /**
   * 🗑️ Eliminar oferta (solo dueño)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.PROFESIONAL)
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.ofertasService.eliminar(id, req.user.id);
  }

  /**
   * ✅ Aceptar oferta (cliente)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.CLIENTE)
  @Post(':id/aceptar')
  aceptarOferta(@Param('id', ParseIntPipe) ofertaId: number, @Req() req) {
    return this.ofertasService.aceptarOferta(ofertaId, req.user.id);
  }
}
