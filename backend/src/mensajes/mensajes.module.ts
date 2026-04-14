import { Module } from '@nestjs/common';
import { MensajesController } from './mensajes.controller';
import { MensajesService } from './mensajes.service';
import { PrismaService } from '../database/prisma.service';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [NotificacionesModule],
  controllers: [MensajesController],
  providers: [MensajesService, PrismaService],
  exports: [MensajesService],
})
export class MensajesModule {}
