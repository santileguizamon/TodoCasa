import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { OmitSensitiveInterceptor } from './common/interceptors/omit-sensitive.interceptor';
import { getJwtRefreshSecret, getJwtSecret } from './auth/jwt.config';

async function bootstrap() {
  getJwtSecret();
  getJwtRefreshSecret();

  // Inicializa la aplicación NestJS a partir del módulo raíz
  const app = await NestFactory.create(AppModule);

  // Permitir el parseo de JSON grandes y formularios (por si se suben imágenes o archivos)
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  // Activar CORS (importante para conectar con el frontend)
  const origenes = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  if (!origenes.length) {
    console.warn('⚠️ CORS_ORIGINS no definida - usando * (solo desarrollo)');
  }
  const corsOrigins: string | string[] =
    !origenes.length || origenes.includes('*') ? '*' : origenes;
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalInterceptors(new OmitSensitiveInterceptor());

  // Pipe global de validación: aplica las validaciones de DTOs automáticamente
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina propiedades que no estén en el DTO
      forbidNonWhitelisted: true, // lanza error si se envían propiedades no definidas
      transform: true, // convierte los tipos automáticamente (ej. string a number)
    }),
  );



  // Arranca el servidor
  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);
  console.log(`🚀 Servidor corriendo en ${PORT}`);
}

bootstrap();
