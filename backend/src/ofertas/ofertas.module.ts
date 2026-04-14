import { Module } from '@nestjs/common';
import { OfertasService } from './ofertas.service';
import { OfertasController } from './ofertas.controller';
import { PrismaService } from '../database/prisma.service';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [NotificacionesModule],
  controllers: [OfertasController],
  providers: [OfertasService, PrismaService],
  exports: [OfertasService],
})
export class OfertasModule {}
