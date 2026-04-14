import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  Req,
} from '@nestjs/common';
import { TrabajosService } from './trabajos.service';
import { CrearTrabajoDto } from './dto/crear-trabajo.dto';
import { ActualizarTrabajoDto } from './dto/actualizar-trabajo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Rol } from '../common/enums';
import { ProfesionalActivoGuard } from '../common/guards/profesional-activo.guard';

@Controller('trabajos')
export class TrabajosController {
  constructor(private readonly trabajosService: TrabajosService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  crear(@Body() dto: CrearTrabajoDto, @Request() req: any) {
    return this.trabajosService.crear({ ...dto, clienteId: req.user.id });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  obtenerDisponibles(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radioKm') radioKm?: string,
    @Query('urgente') urgente?: string,
    @Query('categoria') categoria?: string,
  ) {
    const soloUrgentes = urgente === 'true' ? true : undefined;
    const categoriaFiltro = categoria?.trim() ? categoria.trim() : undefined;

    if (lat && lng && radioKm) {
      return this.trabajosService.obtenerPorUbicacion(
        +lat,
        +lng,
        +radioKm,
        soloUrgentes,
        categoriaFiltro,
      );
    }
    return this.trabajosService.obtenerDisponibles(soloUrgentes, categoriaFiltro);
  }

  @UseGuards(JwtAuthGuard)
  @Get('cliente/id/:id')
  obtenerPorCliente(@Param('id') id: string) {
    return this.trabajosService.obtenerPorCliente(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  obtenerUno(@Param('id') id: string) {
    return this.trabajosService.obtenerUno(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  actualizar(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: ActualizarTrabajoDto,
  ) {
    return this.trabajosService.actualizar(+id, req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('estado/:id')
  cambiarEstado(@Param('id') id: string, @Body('estado') estado: 'PENDIENTE' | 'ASIGNADO' | 'PENDIENTE_CONFIRMACION' | 'FINALIZADO' | 'CANCELADO' | 'EN_RECLAMO') {
    return this.trabajosService.cambiarEstado(+id, estado);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  eliminar(@Param('id') id: string, @Request() req: any) {
    return this.trabajosService.eliminar(+id, req.user.id);
  }

  // 🧾 Cliente confirma la finalización
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.CLIENTE)
  @Patch(':id/finalizar')
  clienteConfirmaFinalizacion(@Param('id') id: string, @Req() req) {
    return this.trabajosService.clienteConfirmaFinalizacion(+id, req.user.id);
  }

  // ⏰ Endpoint para ejecutar auto-confirmación manualmente (admin / pruebas)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMIN)
  @Post('auto-confirmar')
  autoConfirmar() {
    return this.trabajosService.autoConfirmarTrabajosVencidos();
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancelar')
  cancelarTrabajo(@Param('id') id: string, @Request() req: any) {
    return this.trabajosService.cancelarTrabajo(+id, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('cliente/mis-trabajos')
  @Roles(Rol.CLIENTE)
  obtenerMisTrabajosCliente(@Req() req) {
    return this.trabajosService.obtenerPorCliente(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('profesional/mis-trabajos')
  @Roles(Rol.PROFESIONAL)
  obtenerMisTrabajosProfesional(@Req() req) {
    return this.trabajosService.obtenerPorProfesional(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/fecha-acordada')
  definirFechaAcordada(
  @Param('id') id: string,
  @Body('fecha') fecha: string,
  @Request() req: any,
  ) {
    return this.trabajosService.definirFechaAcordada(
    +id,
    req.user.id,
    new Date(fecha),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/puede-valorar')
  puedeValorar(@Param('id') id: string, @Req() req) {
    return this.trabajosService.puedeValorar(+id, req.user.id);
  }

  @UseGuards(JwtAuthGuard, ProfesionalActivoGuard)
  @Patch(':id/marcar-terminado')
  finalizarTrabajoProfesional(
    @Param('id') id: string,
    @Req() req,
  ) {
    return this.trabajosService.profesionalMarcaTerminado(
      +id,
      req.user.id,
    );
  }


  

  
}
