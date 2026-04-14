import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Rol } from '../../common/enums';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Recupera los roles requeridos del decorador @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<Rol[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si el endpoint no requiere roles, lo dejamos pasar
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // Si no hay usuario o su rol no está entre los permitidos, lanzamos error
    if (!user || !requiredRoles.includes(user.rol)) {
      throw new ForbiddenException('No tiene permisos para acceder a este recurso');
    }

    return true;
  }
}

