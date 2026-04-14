import { Controller, Get, Post, Patch, Param, Body, Delete } from '@nestjs/common';
import { SuscripcionesService } from './suscripciones.service';
import { CrearSuscripcionDto } from './dto/crear-suscripcion.dto';
import { ActualizarSuscripcionDto } from './dto/actualizar-suscripcion.dto';
import { UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '@/database/prisma.service';


@Controller('suscripciones')
export class SuscripcionesController {
  constructor(
    private readonly suscripcionesService: SuscripcionesService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  crear(@Body() dto: CrearSuscripcionDto) {
    return this.suscripcionesService.crear(dto);
  }

  @Get()
  obtenerTodas() {
    return this.suscripcionesService.obtenerTodas();
  }

  @UseGuards(JwtAuthGuard)
  @Get('mi-suscripcion')
  async miSuscripcion(@Req() req) {
    return this.prisma.suscripcion.findUnique({
      where: { usuarioId: req.user.id },
    });
  }

  @Get(':id')
  obtenerUna(@Param('id') id: string) {
    return this.suscripcionesService.obtenerUna(+id);
  }

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() dto: ActualizarSuscripcionDto) {
    return this.suscripcionesService.actualizar(+id, dto);
  }

  @Delete(':id')
  cancelar(@Param('id') id: string) {
    return this.suscripcionesService.cancelar(+id);
  }

  
}
