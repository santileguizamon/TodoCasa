import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateMensajeDto {
  // Se ignora: el remitente siempre es el usuario autenticado.
  @IsOptional()
  @IsInt()
  remitenteId?: number;

  @IsInt()
  destinatarioId: number;

  @IsString()
  @MinLength(1)
  contenido: string;
}
