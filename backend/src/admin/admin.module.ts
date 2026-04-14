import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from '../database/prisma.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, PrismaService, NotificacionesService],
})
export class AdminModule {}

