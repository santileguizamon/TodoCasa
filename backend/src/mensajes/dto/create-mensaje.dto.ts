import { IsInt, IsString, MinLength } from 'class-validator';

export class CreateMensajeDto {
  @IsInt()
  remitenteId: number;

  @IsInt()
  destinatarioId: number;

  @IsString()
  @MinLength(1)
  contenido: string;
}
