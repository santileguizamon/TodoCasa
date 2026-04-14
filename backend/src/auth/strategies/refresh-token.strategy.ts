import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../types/jwt-payload.interface';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          // ✅ Extrae el token de las cookies o del header Authorization
          const token =
            req?.cookies?.refreshToken ||
            req?.headers['authorization']?.replace('Bearer ', '');
          return token;
        },
      ]),
      secretOrKey: process.env.JWT_REFRESH_SECRET || 'refreshSecretKey',
      passReqToCallback: true,
    });
  }

  /**
   * Valida que el token de refresco sea válido y que coincida con el guardado en BD.
   */
  async validate(req: Request, payload: JwtPayload) {
    const refreshToken =
      req?.cookies?.refreshToken ||
      req?.headers['authorization']?.replace('Bearer ', '');

    if (!refreshToken) {
      throw new UnauthorizedException('Token de refresco no proporcionado');
    }

    const user = await this.authService.validarRefreshToken(
      payload.userId,
      refreshToken,
    );
    if (!user) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    return user;
  }
}
