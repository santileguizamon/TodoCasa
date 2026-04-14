import { Module } from '@nestjs/common';
import { PrismaModule } from './database/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TrabajosModule } from './trabajos/trabajos.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfesionalesModule } from './profesionales/profesionales.module';
import { EspecialidadesModule } from './especialidades/especialidades.module';
import { OfertasModule } from './ofertas/ofertas.module';
import { ChatModule } from './chat/chat.module';
import { MensajesModule } from './mensajes/mensajes.module';
import { SuscripcionesModule } from './suscripciones/suscripciones.module';
import { PagosModule } from './pagos/pagos.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { ValoracionesModule } from './valoraciones/valoraciones.module';
import { VerificacionModule } from './verificacion/verificacion.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProfesionalesModule,
    EspecialidadesModule,
    TrabajosModule,
    OfertasModule,
    ChatModule,
    MensajesModule,
    SuscripcionesModule,
    PagosModule,
    NotificacionesModule,
    ValoracionesModule,
    VerificacionModule,
    AdminModule,
  ],
})
export class AppModule {}



