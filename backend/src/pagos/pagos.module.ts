import { Module } from '@nestjs/common';
import { PagosController } from './pagos.controller';
import { PagosService } from './pagos.service';
import { PrismaService } from '../database/prisma.service';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { VerificacionModule } from '../verificacion/verificacion.module';

@Module({
  imports: [NotificacionesModule, VerificacionModule],
  controllers: [PagosController],
  providers: [PagosService, PrismaService],
  exports: [PagosService],
})
export class PagosModule {}

