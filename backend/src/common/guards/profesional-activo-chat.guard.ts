import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
  } from '@nestjs/common';
  import { PrismaService } from 'src/database/prisma.service';
  import { Rol } from 'src/common/enums';
  
  @Injectable()
  export class ProfesionalActivoChatGuard implements CanActivate {
    constructor(private prisma: PrismaService) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const req = context.switchToHttp().getRequest();
      const user = req.user;
  
      // 👉 Cliente siempre puede chatear
      if (user.rol === Rol.CLIENTE) {
        return true;
      }
  
      // 👉 Si no es profesional, fuera
      if (user.rol !== Rol.PROFESIONAL) {
        throw new ForbiddenException('Rol no autorizado');
      }
  
      const suscripcion = await this.prisma.suscripcion.findUnique({
        where: { usuarioId: user.id },
      });
  
      if (!suscripcion || !suscripcion.activa) {
        throw new ForbiddenException(
          'Tu suscripción está vencida. No puedes enviar mensajes.',
        );
      }
  
      if (suscripcion.fechaFin < new Date()) {
        throw new ForbiddenException(
          'Tu suscripción está vencida. Renueva para continuar.',
        );
      }
  
      return true;
    }
  }
  