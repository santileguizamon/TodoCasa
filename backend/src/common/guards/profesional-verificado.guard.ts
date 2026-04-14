import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Rol, EstadoVerificacion } from '../enums';
import { tieneSuscripcionValida } from '../helpers/suscripcion.helper';

@Injectable()
export class ProfesionalVerificadoGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const usuario = request.user;

    if (!usuario) return false;

    // Solo aplica a profesionales
    if (usuario.rol !== Rol.PROFESIONAL) {
      return true;
    }

    const [verificacion, suscripcion] = await Promise.all([
      this.prisma.verificacion.findUnique({
        where: { usuarioId: usuario.id },
      }),
      this.prisma.suscripcion.findUnique({
        where: { usuarioId: usuario.id },
      }),
    ]);

    const verificadoPorProceso =
      verificacion?.estado === EstadoVerificacion.APROBADA;
    const verificadoPorSuscripcion = tieneSuscripcionValida(suscripcion);

    if (!verificadoPorProceso && !verificadoPorSuscripcion) {
      throw new ForbiddenException(
        'Tu perfil profesional aun no esta verificado.',
      );
    }

    return true;
  }
}
