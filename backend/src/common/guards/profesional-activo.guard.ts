import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
  } from '@nestjs/common';
  import { PrismaService } from 'src/database/prisma.service';
  import { tieneSuscripcionValida } from '../helpers/suscripcion.helper';
  import { Rol } from '../enums';
  
  @Injectable()
  export class ProfesionalActivoGuard implements CanActivate {
    constructor(private prisma: PrismaService) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const usuario = request.user;
  
      if (!usuario) return false;
  
      // 👉 Solo aplica a profesionales
      if (usuario.rol !== Rol.PROFESIONAL) {
        return true;
      }
  
      const suscripcion = await this.prisma.suscripcion.findUnique({
        where: { usuarioId: usuario.id },
      });
  
      const esValida = tieneSuscripcionValida(suscripcion);
  
      if (!esValida) {
        throw new ForbiddenException(
          'Tu suscripción venció. Renovala para continuar operando.',
        );
      }
  
      return true;
    }
  }
  