  import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
  } from '@nestjs/common';
  import { PrismaService } from '../../database/prisma.service';
  import { Rol } from '../enums';
  
  @Injectable()
  export class SuscripcionActivaGuard implements CanActivate {
    constructor(private prisma: PrismaService) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const user = request.user;
  
      if (!user) {
        return false;
      }
  
      // 🟢 ADMIN y CLIENTE no tienen restricción
      if (user.rol === Rol.ADMIN || user.rol === Rol.CLIENTE) {
        return true;
      }
  
      // ⛔ Solo bloquea a PROFESIONAL
      if (user.rol !== Rol.PROFESIONAL) {
        return true;
      }
  
      const suscripcion = await this.prisma.suscripcion.findUnique({
        where: { usuarioId: user.id },
      });
  
      if (!suscripcion || !suscripcion.fechaFin) {
        throw new ForbiddenException(
          'Necesitás una suscripción activa para realizar esta acción',
        );
      }
  
      const ahora = new Date();
      const fechaFin = new Date(suscripcion.fechaFin);
  
      // ⏳ período de gracia: 5 días
      const fechaConGracia = new Date(fechaFin);
      fechaConGracia.setDate(fechaConGracia.getDate() + 5);
  
      if (ahora > fechaConGracia) {
        throw new ForbiddenException(
          'Tu suscripción venció. Renovala para seguir usando esta función',
        );
      }
  
      return true;
    }
  }
  
