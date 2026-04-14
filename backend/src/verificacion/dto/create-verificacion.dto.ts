import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateVerificacionDto {
  @IsOptional()
  @IsInt()
  usuarioId: number;

  @IsOptional()
  @IsString()
  comprobante?: string;
}

