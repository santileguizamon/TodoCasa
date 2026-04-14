import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';

export class ActualizarTrabajoDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  rangoMin?: number;

  @IsOptional()
  @IsNumber()
  rangoMax?: number;

  @IsOptional()
  @IsBoolean()
  urgente?: boolean;

  @IsOptional()
  @IsString()
  categoria?: string;
}
