import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JwtSignOptions } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * 🆕 Registro usuario
   */
  async register(
    nombre: string,
    email: string,
    password: string,
    rol: string = 'CLIENTE',
  ) {
    const existe = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (existe)
      throw new ConflictException('El correo ya está registrado');

    const hash = await bcrypt.hash(password, 10);

    const usuario = await this.prisma.usuario.create({
      data: {
        nombre,
        email,
        password: hash,
        rol: rol as any,
        activo: true,
      },
    });

    if (usuario.rol === 'PROFESIONAL') {
      await this.prisma.profesional.create({
        data: {
          idUsuario: usuario.id,
          descripcion: '',
          valorHora: 0,
          extraUrgencia: 1.5,
        },
      });
    }

    const tokens = await this.generarTokens(
      usuario.id,
      usuario.email,
      usuario.rol,
    );

    await this.guardarRefreshToken(usuario.id, tokens.refresh_token);

    return {
      message: 'Usuario registrado con éxito',
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        direccion: usuario.direccion ?? null,
        lat: usuario.lat ?? null,
        lng: usuario.lng ?? null,
      },
      ...tokens,
    };
  }

  /**
   * 🔐 Validar credenciales login local
   */
  async validateUser(email: string, password: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) return null;
    if (!usuario.activo) return null;

    const esValido = await bcrypt.compare(
      password,
      usuario.password,
    );

    if (!esValido) return null;

    const { password: _, refreshTokenHash, ...resto } =
      usuario as any;

    return resto;
  }

  /**
   * 🚀 Login
   */
  async login(userId: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuario)
      throw new UnauthorizedException('Usuario no encontrado');

    const tokens = await this.generarTokens(
      usuario.id,
      usuario.email,
      usuario.rol,
    );

    await this.guardarRefreshToken(usuario.id, tokens.refresh_token);

    return {
      message: 'Inicio de sesión exitoso',
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        direccion: usuario.direccion ?? null,
        lat: usuario.lat ?? null,
        lng: usuario.lng ?? null,
      },
      ...tokens,
    };
  }

  /**
   * 🪙 Generar tokens
   */
  private async generarTokens(
  userId: number,
  email: string,
  rol: string,
) {
  const payload = { userId, email, rol };

  const accessOptions: JwtSignOptions = {
  expiresIn: jwtConstants.expiresIn as any,
};

const refreshOptions: JwtSignOptions = {
  secret: jwtConstants.refreshSecret,
  expiresIn: jwtConstants.refreshExpiresIn as any,
};

  const access_token = this.jwtService.sign(payload, accessOptions);
  const refresh_token = this.jwtService.sign(payload, refreshOptions);

  return { access_token, refresh_token };
}


  /**
   * 💾 Guardar refresh token hash
   */
  private async guardarRefreshToken(
    userId: number,
    refreshToken: string,
  ) {
    const hash = await bcrypt.hash(refreshToken, 10);

    await this.prisma.usuario.update({
      where: { id: userId },
      data: { refreshTokenHash: hash },
    });
  }

  /**
   * 🔄 Refresh tokens
   */
  async refreshTokens(userId: number, refreshToken: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuario || !usuario.refreshTokenHash)
      throw new UnauthorizedException(
        'No existe refresh token válido',
      );

    if (!usuario.activo) {
      throw new ForbiddenException('Cuenta suspendida');
    }

    const valido = await bcrypt.compare(
      refreshToken,
      usuario.refreshTokenHash,
    );

    if (!valido)
      throw new ForbiddenException('Refresh token inválido');

    const tokens = await this.generarTokens(
      usuario.id,
      usuario.email,
      usuario.rol,
    );

    await this.guardarRefreshToken(usuario.id, tokens.refresh_token);

    return {
      message: 'Tokens renovados correctamente',
      ...tokens,
    };
  }

  async validarRefreshToken(userId: number, refreshToken: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuario || !usuario.refreshTokenHash) return null;
    if (!usuario.activo) return null;

    const valido = await bcrypt.compare(refreshToken, usuario.refreshTokenHash);
    if (!valido) return null;

    return {
      id: usuario.id,
      userId: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    };
  }

  /**
   * 🚪 Logout real
   */
  async logout(userId: number) {
    await this.prisma.usuario.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });

    return {
      message: 'Sesión cerrada correctamente',
    };
  }
}



