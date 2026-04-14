import { Module } from '@nestjs/common';
import { SuscripcionesService } from './suscripciones.service';
import { SuscripcionesController } from './suscripciones.controller';
import { PrismaService } from '../database/prisma.service';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { SuscripcionesCron } from './suscripciones.cron';

@Module({
  imports: [NotificacionesModule],
  controllers: [SuscripcionesController],
  providers: [SuscripcionesService, PrismaService, SuscripcionesCron],
  exports: [SuscripcionesService],
})
export class SuscripcionesModule {}
