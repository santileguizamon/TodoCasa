import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Rol } from '../common/enums';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // 👥 Listar todos los usuarios
  @Get('usuarios')
  obtenerUsuarios() {
    return this.adminService.obtenerUsuarios();
  }

  // 🚫 Suspender usuario
  @Patch('usuarios/:id/suspender')
  suspenderUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Body('motivo') motivo: string,
  ) {
    return this.adminService.suspenderUsuario(id, motivo);
  }

  // ✅ Reactivar usuario
  @Patch('usuarios/:id/reactivar')
  reactivarUsuario(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.reactivarUsuario(id);
  }

  // 🧾 Obtener trabajos
  @Get('trabajos')
  obtenerTrabajos() {
    return this.adminService.obtenerTrabajos();
  }

  // ⚠️ Eliminar trabajo inapropiado
  @Delete('trabajos/:id')
  eliminarTrabajo(
    @Param('id', ParseIntPipe) id: number,
    @Body('motivo') motivo: string,
  ) {
    return this.adminService.eliminarTrabajo(id, motivo);
  }

  // 🚨 Reportes del sistema
  @Get('reportes')
  obtenerReportes() {
    return this.adminService.obtenerReportes();
  }

  // 📊 Métricas generales
  @Get('estadisticas')
  obtenerEstadisticas() {
    return this.adminService.obtenerEstadisticas();
  }

  // 📋 Ofertas (admin)
@Get('ofertas')
obtenerOfertas() {
  return this.adminService.obtenerOfertas();
}

@Patch('ofertas/:id/rechazar')
rechazarOferta(@Param('id', ParseIntPipe) id: number) {
  return this.adminService.rechazarOferta(id);
}

}
