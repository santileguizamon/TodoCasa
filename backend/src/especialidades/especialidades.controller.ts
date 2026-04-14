import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { EspecialidadesService } from './especialidades.service';
import { CreateEspecialidadDto } from './dto/create-especialidad.dto';
import { UpdateEspecialidadDto } from './dto/update-especialidad.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Rol } from '../common/enums';

@Controller('especialidades')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EspecialidadesController {
  constructor(private readonly especialidadesService: EspecialidadesService) {}

  @Post()
  @Roles(Rol.ADMIN)
  create(@Body() dto: CreateEspecialidadDto) {
    return this.especialidadesService.create(dto);
  }

  @Get()
  @Roles(Rol.ADMIN, Rol.PROFESIONAL, Rol.CLIENTE)
  findAll(@Req() req) {
    const onlyActive = req.user?.rol !== Rol.ADMIN;
    return this.especialidadesService.findAll(onlyActive);
  }

  @Get(':id')
  @Roles(Rol.ADMIN, Rol.PROFESIONAL, Rol.CLIENTE)
  findOne(@Param('id') id: string) {
    return this.especialidadesService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Rol.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateEspecialidadDto) {
    return this.especialidadesService.update(+id, dto);
  }

  @Delete(':id')
  @Roles(Rol.ADMIN)
  remove(@Param('id') id: string) {
    return this.especialidadesService.remove(+id);
  }
}
