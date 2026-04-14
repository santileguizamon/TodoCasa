import { IsInt, IsString, Min, Max, IsOptional } from 'class-validator';

export class CrearValoracionDto {
  @IsOptional()
  @IsInt()
  clienteId?: number;

  @IsInt()
  profesionalId: number;

  @IsInt()
  trabajoId: number;

  @IsInt()
  @Min(1)
  @Max(5)
  puntaje: number;

  @IsString()
  comentario: string; // Ahora es obligatorio
}
