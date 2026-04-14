import { IsString, IsNumber, IsIn } from 'class-validator';

export class CreatePagoDto {
  @IsNumber()
  monto: number;

  @IsString()
  @IsIn(['SUSCRIPCION', 'VERIFICACION'])
  tipo: 'SUSCRIPCION' | 'VERIFICACION';
}

