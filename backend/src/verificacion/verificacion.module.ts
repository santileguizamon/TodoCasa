import { Module } from '@nestjs/common';
import { VerificacionService } from './verificacion.service';
import { VerificacionController } from './verificacion.controller';
import { PrismaService } from '../database/prisma.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

@Module({
  controllers: [VerificacionController],
  providers: [VerificacionService, PrismaService, NotificacionesService],
  exports: [VerificacionService],
})
export class VerificacionModule {}
