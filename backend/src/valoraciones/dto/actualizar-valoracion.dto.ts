import { IsInt, IsOptional, IsString, Min, Max, MinLength } from 'class-validator';

export class ActualizarValoracionDto {
  @IsOptional()
  @IsInt({ message: 'El puntaje debe ser un número entero' })
  @Min(1, { message: 'El puntaje mínimo es 1' })
  @Max(5, { message: 'El puntaje máximo es 5' })
  puntaje?: number;

  @IsOptional()
  @IsString({ message: 'El comentario debe ser texto' })
  @MinLength(3, { message: 'El comentario debe tener al menos 3 caracteres' })
  comentario?: string;
}

