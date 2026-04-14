import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SuscripcionesService } from './suscripciones.service';

@Injectable()
export class SuscripcionesCron {
  private readonly logger = new Logger(SuscripcionesCron.name);

  constructor(private readonly suscripcionesService: SuscripcionesService) {}

  // 🕐 Ejecutar todos los días a las 8:00 AM
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async revisarSuscripcionesPorVencer() {
    this.logger.log('⏰ Ejecutando revisión de suscripciones por vencer...');
    const resultado = await this.suscripcionesService.verificarProximosVencimientos();
    this.logger.log(`✅ ${resultado.total} notificaciones enviadas.`);
  }
}
