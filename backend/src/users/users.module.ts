import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { GeocodingService } from '@/common/services/geocoding.service';

@Module({
  providers: [UsersService, GeocodingService],
  controllers: [UsersController]
})
export class UsersModule {}
