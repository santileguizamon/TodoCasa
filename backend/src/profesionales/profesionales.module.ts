import { Module } from '@nestjs/common';
import { ProfesionalesService } from './profesionales.service';
import { ProfesionalesController } from './profesionales.controller';
import { PrismaService } from '../database/prisma.service';

@Module({
  controllers: [ProfesionalesController],
  providers: [ProfesionalesService, PrismaService],
})
export class ProfesionalesModule {}
