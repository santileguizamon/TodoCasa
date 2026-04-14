import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ProfesionalesService } from './profesionales.service';
import { CreateProfesionalDto } from './dto/create-profesional.dto';
import { UpdateProfesionalDto } from './dto/update-profesional.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Rol } from '../common/enums';

@Controller('profesionales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProfesionalesController {
  constructor(private readonly profesionalesService: ProfesionalesService) {}

  @Post()
  @Roles(Rol.PROFESIONAL, Rol.ADMIN)
  create(@Body() dto: CreateProfesionalDto) {
    return this.profesionalesService.create(dto);
  }

  @Get()
  @Roles(Rol.ADMIN, Rol.CLIENTE, Rol.PROFESIONAL)
  findAll() {
    return this.profesionalesService.findAll();
  }

  @Get('me')
  @Roles(Rol.PROFESIONAL)
  getMe(@Req() req) {
    return this.profesionalesService.obtenerMiPerfil(req.user.userId)
  }

  @Get(':id')
  @Roles(Rol.ADMIN, Rol.CLIENTE, Rol.PROFESIONAL)
  findOne(@Param('id') id: string) {
    return this.profesionalesService.findOne(+id);
  }

  @Patch('me')
  @Roles(Rol.PROFESIONAL)
  updateMe(@Req() req, @Body() dto: UpdateProfesionalDto) {
    return this.profesionalesService.update(req.user.userId, dto);
  }

  @Delete(':id')
  @Roles(Rol.ADMIN)
  remove(@Param('id') id: string) {
    return this.profesionalesService.remove(+id);
  }

  @Patch('me/perfil')
  @Roles(Rol.PROFESIONAL)
  updatePerfil(
    @Req() req,
    @Body() dto: UpdateProfesionalDto
  ) {
    return this.profesionalesService.updatePerfil(
      req.user.userId,
      dto
    );
  }
}

