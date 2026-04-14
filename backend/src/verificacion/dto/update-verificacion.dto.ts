import { PartialType } from '@nestjs/mapped-types';
import { CreateVerificacionDto } from './create-verificacion.dto';

export class UpdateVerificacionDto extends PartialType(CreateVerificacionDto) 
{estado?: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';}
