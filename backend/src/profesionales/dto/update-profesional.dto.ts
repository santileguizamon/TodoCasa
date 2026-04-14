import { PartialType } from '@nestjs/mapped-types';
import { CreateProfesionalDto } from './create-profesional.dto';
import { IsOptional,IsString,IsNumber,IsArray,IsBoolean } from 'class-validator';

export class UpdateProfesionalDto extends PartialType(CreateProfesionalDto) {
    @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  valorHora?: number;

  @IsOptional()
  @IsNumber()
  urgencias?: number;

  @IsOptional()
  @IsArray()
  id_especialidades?: number[];

  @IsOptional()
  @IsNumber()
  id_usuario: number;
}
