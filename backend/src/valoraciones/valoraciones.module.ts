import { Module } from '@nestjs/common';
import { ValoracionesService } from './valoraciones.service';
import { ValoracionesController } from './valoraciones.controller';
import { PrismaService } from 'src/database/prisma.service';

@Module({
  controllers: [ValoracionesController],
  providers: [ValoracionesService, PrismaService],
})
export class ValoracionesModule {}
