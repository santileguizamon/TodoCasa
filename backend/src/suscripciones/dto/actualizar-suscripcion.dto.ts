import { IsOptional, IsEnum, IsBoolean, IsDateString } from 'class-validator';
import { NivelSuscripcion } from './crear-suscripcion.dto';

export class ActualizarSuscripcionDto {
  @IsOptional()
  @IsEnum(NivelSuscripcion)
  nivel?: NivelSuscripcion;

  @IsOptional()
  @IsBoolean()
  activa?: boolean;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;
}
