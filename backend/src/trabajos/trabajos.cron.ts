import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TrabajosService } from './trabajos.service';

@Injectable()
export class TrabajosCron {
  private readonly logger = new Logger(TrabajosCron.name);

  constructor(private readonly trabajosService: TrabajosService) {}

  /**
   * ⏰ Se ejecuta cada hora
   * Finaliza automáticamente trabajos ASIGNADOS
   * cuya fechaAcordada fue hace más de 72 horas
   */
  @Cron(CronExpression.EVERY_HOUR)
  async autoFinalizarTrabajos() {
    const result =
      await this.trabajosService.autoConfirmarTrabajosVencidos();

    this.logger.log(
      `Cron ejecutado: ${result.total} trabajos auto-finalizados`,
    );
  }
}

