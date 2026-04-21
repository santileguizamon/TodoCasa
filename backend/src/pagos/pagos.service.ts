import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { VerificacionService } from '../verificacion/verificacion.service';
import { TipoNotificacion } from '../common/enums';
import * as mercadopago from 'mercadopago';

@Injectable()
export class PagosService {
  private mpClient: any;
  private readonly logger = new Logger(PagosService.name);

  constructor(
    private prisma: PrismaService,
    private notificacionesService: NotificacionesService,
    private verificacionService: VerificacionService,
  ) {
    this.mpClient = new (mercadopago as any).MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN,
    });
  }

  /**
   * Crear preferencia de pago
   */
  async crearPreferencia(dto: {
    usuarioId: number;
    monto: number;
    tipo: 'SUSCRIPCION' | 'VERIFICACION';
  }) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: dto.usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    let titulo = '';
    let monto = dto.monto;

    if (dto.tipo === 'SUSCRIPCION') {
      titulo = 'Suscripción mensual';
    } else if (dto.tipo === 'VERIFICACION') {
      titulo = 'Verificación profesional';
    } else {
      throw new BadRequestException('Tipo de pago inválido');
    }

    const externalReference = `${usuario.id}-${dto.tipo}-${Date.now()}`;

    const preferenceClient = new (mercadopago as any).Preference(this.mpClient);

    const frontUrl = process.env.FRONT_URL?.trim();
    const backUrl = process.env.BACK_URL?.trim();

    const isValidPublicUrl = (url?: string) => {
      if (!url) return false;
      if (!/^https?:\/\//i.test(url)) return false;
      if (/REEMPLAZAR|example|localhost|127\.0\.0\.1/i.test(url)) return false;
      return true;
    };

    const hasFrontUrl = isValidPublicUrl(frontUrl);
    const hasBackUrl = isValidPublicUrl(backUrl);

    const body: any = {
      items: [
        {
          title: titulo,
          quantity: 1,
          currency_id: 'ARS',
          unit_price: monto,
        },
      ],
      payer: {
        email: usuario.email,
      },
      external_reference: externalReference,
    };

    // En local puede no existir FRONT_URL/BACK_URL publica.
    // Solo enviamos estas URLs si están bien configuradas.
    if (hasFrontUrl) {
      body.back_urls = {
        success: `${frontUrl}/pagos/exito`,
        failure: `${frontUrl}/pagos/error`,
        pending: `${frontUrl}/pagos/pendiente`,
      };
      body.auto_return = 'approved';
    }

    if (hasBackUrl) {
      body.notification_url = `${backUrl}/pagos/webhook`;
    }

    let preference: any;
    try {
      preference = await preferenceClient.create({ body });
    } catch (error: any) {
      const mpMessage =
        error?.cause?.message ||
        error?.message ||
        'No se pudo crear la preferencia de pago en Mercado Pago';

      this.logger.error(`Error creando preferencia MP: ${mpMessage}`);
      throw new BadRequestException(
        `Mercado Pago rechazo la preferencia: ${mpMessage}`,
      );
    }

    const pago = await this.prisma.pago.create({
      data: {
        usuarioId: usuario.id,
        monto,
        descripcion: titulo,
        estado: 'PENDIENTE',
        referenciaMP: externalReference,
        tipo: dto.tipo,
      },
    });

    return {
      init_point: preference.init_point,
      pago,
    };
  }

  /**
   * Webhook Mercado Pago
   */
  async procesarWebhook(payload: any) {
    if (!payload?.data?.id) return;

    const paymentClient = new (mercadopago as any).Payment(this.mpClient);
    const payment = await paymentClient.get({ id: payload.data.id });

    const externalReference = payment.external_reference;
    const status = payment.status;

    const pago = await this.prisma.pago.findFirst({
      where: { referenciaMP: externalReference },
    });

    if (!pago) {
      throw new NotFoundException('Pago no encontrado');
    }

    let nuevoEstado: 'PENDIENTE' | 'COMPLETADO' | 'FALLIDO' = 'PENDIENTE';

    if (status === 'approved') nuevoEstado = 'COMPLETADO';
    if (status === 'rejected' || status === 'cancelled') nuevoEstado = 'FALLIDO';

    await this.prisma.pago.update({
      where: { id: pago.id },
      data: { estado: nuevoEstado },
    });

    if (nuevoEstado !== 'COMPLETADO') return;

     await this.aplicarEfectosPagoAprobado(pago);

    
  }

  /**
   * Consultas
   */
  async obtenerPagosUsuario(usuarioId: number) {
    return this.prisma.pago.findMany({
      where: { usuarioId },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async obtenerPago(id: number) {
    const pago = await this.prisma.pago.findUnique({ where: { id } });
    if (!pago) throw new NotFoundException('Pago no encontrado');
    return pago;
  }

  async confirmarPagoManual(id: number) {
    const pago = await this.prisma.pago.findUnique({
      where: { id },
    });
  
    if (!pago) {
      throw new NotFoundException('Pago no encontrado');
    }
  
    if (pago.estado === 'COMPLETADO') {
      throw new BadRequestException('El pago ya está confirmado');
    }
  
    if (pago.tipo !== 'SUSCRIPCION') {
      throw new BadRequestException(
        'Solo se pueden confirmar manualmente pagos de suscripcion',
      );
    }

    if (!pago.referenciaMP) {
      throw new BadRequestException(
        'No se puede confirmar: no existe preferencia de pago asociada',
      );
    }

    const actualizado = await this.prisma.pago.update({
      where: { id },
      data: { estado: 'COMPLETADO' },
    });
  
    await this.aplicarEfectosPagoAprobado(actualizado);
  
    return actualizado;
  }

  async obtenerPagoSeguro(pagoId: number, usuarioId: number) {
    const pago = await this.prisma.pago.findUnique({
      where: { id: pagoId },
    });
  
    if (!pago) {
      throw new NotFoundException('Pago no encontrado');
    }
  
    if (pago.usuarioId !== usuarioId) {
      throw new ForbiddenException('No tienes acceso a este pago');   
    }
  
    return pago;
  }

  private async aplicarEfectosPagoAprobado(pago: {
    id: number;
    usuarioId: number;
    referenciaMP: string;
  }) {
    const partes = pago.referenciaMP.split('-');
    const tipo = partes[1]; // SUSCRIPCION | VERIFICACION
  
    /**
     * ✅ SUSCRIPCIÓN
     */
    if (tipo === 'SUSCRIPCION') {
      const inicio = new Date();
      const fin = new Date(inicio);
      fin.setDate(fin.getDate() + 31);
  
      await this.prisma.suscripcion.upsert({
        where: { usuarioId: pago.usuarioId },
        update: {
          activa: true,
          fechaInicio: inicio,
          fechaFin: fin,
        },
        create: {
          usuarioId: pago.usuarioId,
          nivel: 'BASICO',
          activa: true,
          fechaInicio: inicio,
          fechaFin: fin,
        },
      });
  
      await this.notificacionesService.crear({
        usuarioId: pago.usuarioId,
        tipo: TipoNotificacion.SUSCRIPCION_POR_VENCER,
        mensaje: 'Tu suscripción fue activada correctamente.',
      });
      await this.prisma.verificacion.upsert({
        where: { usuarioId: pago.usuarioId },
        update: {
          estado: 'APROBADA',
          verificadaEn: new Date(),
        },
        create: {
          usuarioId: pago.usuarioId,
          estado: 'APROBADA',
          verificadaEn: new Date(),
        },
      });

      await this.prisma.usuario.update({
        where: { id: pago.usuarioId },
        data: { verificado: true },
      });
    }
  
    /**
     * ✅ VERIFICACIÓN
     */

    if (tipo === 'VERIFICACION') {
      await this.verificacionService.aprobar(pago.usuarioId);
  
      await this.notificacionesService.crear({
        usuarioId: pago.usuarioId,
        tipo: TipoNotificacion.OFERTA_ACEPTADA,
        mensaje: 'Tu perfil profesional fue verificado.',
      });
    }
  }
}



