import {
  IsInt,
  IsString,
  IsBoolean,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsLatitude,
  IsLongitude,
} from 'class-validator';

export class CrearTrabajoDto {
  @IsInt()
  clienteId: number;

  @IsString()
  titulo: string;

  @IsString()
  descripcion: string;

  @IsNumber()
  @Min(0)
  rangoMin: number;

  @IsNumber()
  @Min(0)
  rangoMax: number;

  @IsOptional()
  @IsBoolean()
  urgente?: boolean;

  // 🌍 Coordenadas opcionales de ubicación del trabajo
  @IsOptional()
  @IsLatitude()
  lat?: number;

  @IsOptional()
  @IsLongitude()
  lng?: number;

  // 📍 Radio sugerido de búsqueda (si aplica, ej. para trabajos locales)
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  radioKm?: number;

  @IsOptional()
  @IsString()
  direccion?: string

  @IsOptional()
  @IsString()
  categoria?: string;
}
