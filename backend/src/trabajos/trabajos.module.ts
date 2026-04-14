import { Module } from '@nestjs/common';
import { TrabajosService } from './trabajos.service';
import { TrabajosController } from './trabajos.controller';
import { PrismaService } from '../database/prisma.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TrabajosCron } from './trabajos.cron';
import { GeocodingService } from '../common/services/geocoding.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [TrabajosController],
  providers: [
    TrabajosService,
    PrismaService,
    NotificacionesService,
    GeocodingService,
    TrabajosCron,
  ],
})
export class TrabajosModule {}
