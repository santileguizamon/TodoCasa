import { IsInt, IsEnum } from 'class-validator';

export enum NivelSuscripcion {
  BASICO = 'BASICO',
  PREMIUM = 'PREMIUM',
}

export class CrearSuscripcionDto {
  @IsInt()
  usuarioId: number;

  @IsEnum(NivelSuscripcion)
  nivel: NivelSuscripcion;
}