import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../database/prisma.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';

@Module({
  imports: [
    UsersModule,
    PrismaModule, // ✅ Necesario para guardar y verificar el refresh token hash
    PassportModule,
    JwtModule.register({
      global: true, // ✅ Permite usar JwtService sin reimportarlo en otros módulos
      secret: process.env.JWT_SECRET || 'superSecretKey', // ⚠️ Usar variable de entorno
      signOptions: { expiresIn: '15m' }, // token corto de acceso
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    RefreshTokenStrategy, // ✅ Estrategia adicional para refresh tokens
  ],
  exports: [AuthService],
})
export class AuthModule {}


