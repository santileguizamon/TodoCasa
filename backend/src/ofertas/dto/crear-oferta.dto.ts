import { IsInt, IsNumber, IsOptional } from 'class-validator';

export class CrearOfertaDto {
  @IsInt()
  trabajoId: number;

  @IsOptional()
  @IsInt()
  profesionalId?: number;

  @IsNumber()
  monto: number;
}
