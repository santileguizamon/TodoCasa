import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateEspecialidadDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}
