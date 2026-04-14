import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  BadRequestException,
  HttpCode,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PagosService } from './pagos.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { WebhookDto } from './dto/webhook.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Rol } from 'src/common/enums';

@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async iniciarPago(@Body() dto: CreatePagoDto, @Req() req) {
    if (!dto.tipo || !dto.monto) {
      throw new BadRequestException('Faltan datos obligatorios');
    }

    return this.pagosService.crearPreferencia({
      ...dto,
      usuarioId: req.user.id,
    });
  }

  @Post('webhook')
  @HttpCode(200)
  async recibirWebhook(@Body() body: WebhookDto) {
    await this.pagosService.procesarWebhook(body);
    return { message: 'Webhook procesado correctamente' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('usuario/mis-pagos')
  async obtenerMisPagos(@Req() req) {
    return this.pagosService.obtenerPagosUsuario(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async obtenerPago(@Param('id') id: string, @Req() req) {
    return this.pagosService.obtenerPagoSeguro(+id, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMIN)
  @Post(':id/confirmar')
  async confirmarPagoManual(@Param('id') id: string) {
    return this.pagosService.confirmarPagoManual(+id);
  }
}
