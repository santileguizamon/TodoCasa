import { TipoNotificacion } from '@prisma/client';

export class CreateNotificacioneDto {
  usuarioId: number;
  tipo: TipoNotificacion;
  mensaje: string;
  trabajoId?: number;
  leida?: boolean;
}

export class CrearNotificacionDto extends CreateNotificacioneDto {}
