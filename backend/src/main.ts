import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';

async function bootstrap() {
  // Inicializa la aplicación NestJS a partir del módulo raíz
  const app = await NestFactory.create(AppModule);

  // Permitir el parseo de JSON grandes y formularios (por si se suben imágenes o archivos)
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  // Activar CORS (importante para conectar con el frontend)
  app.enableCors({
    origin: '*', // Podés restringirlo a tu frontend en producción
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

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
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
}

bootstrap();
