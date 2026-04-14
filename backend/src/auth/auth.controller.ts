import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 🆕 Registro de nuevos usuarios
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.nombre, dto.email, dto.password,dto.rol);
  }

  /**
   * 🔐 Login usando estrategia local (email + password)
   */
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req: any) {
    const user = req.user;
    return this.authService.login(user.id);
  }

  /**
   * 🔄 Refrescar tokens de sesión
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: { userId: number; refresh_token: string }) {
    const { userId, refresh_token } = body;
    if (!userId || !refresh_token) {
      return { message: 'Faltan datos requeridos (userId o refresh_token)' };
    }
    return this.authService.refreshTokens(userId, refresh_token);
  }

  /**
   * 🚪 Cerrar sesión (invalida refresh token)
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: any) {
    await this.authService.logout(req.user.id);
    return { message: 'Sesión cerrada correctamente' };
  }

  /**
   * 👤 Obtener usuario autenticado actual
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  me(@Request() req: any) {
    return {
      message: 'Usuario autenticado',
      user: req.user,
    };
  }
}
