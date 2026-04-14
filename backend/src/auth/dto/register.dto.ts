import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsEnum } from 'class-validator';
import { Rol } from '@prisma/client';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100, { message: 'El nombre no puede superar los 100 caracteres' })
  nombre: string;

  @IsEmail({}, { message: 'Debe ingresar un correo electrónico válido' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @MaxLength(50, { message: 'La contraseña no puede superar los 50 caracteres' })
  password: string;

  @IsEnum(Rol, { message: 'Rol inválido' })
  rol: Rol;
}
