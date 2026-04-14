import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreateProfesionalDto {
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsNumber()
  valorHora: number;

  @IsNumber()
  extraUrgencia: number;

  @IsArray()
  @IsNumber({}, { each: true })
  id_especialidades: number[];

  @IsNumber()
  id_usuario: number; // FK hacia usuario
}
