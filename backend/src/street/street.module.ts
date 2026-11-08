import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StreetService } from './street.service.js';
import { StreetController } from './street.controller.js';
import { Street } from '../modules/entities/street.entity.js';
import { StreetImage } from '../modules/entities/street-image.entity.js';
import { StreetCheckIn } from '../modules/entities/street-checkin.entity.js';
import { UploadModule } from '../upload/upload.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Street, StreetImage, StreetCheckIn]),
    UploadModule,
    AuthModule,
  ],
  controllers: [StreetController],
  providers: [StreetService],
  exports: [StreetService],
})
export class StreetModule {}
