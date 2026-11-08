import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { AuthGuard } from './guards/auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import { User } from '../modules/entities/user.entity.js';
import { EncryptionModule } from '../encryption/encryption.module.js';
import { EmailModule } from '../email/email.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([User]), EncryptionModule, EmailModule],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, RolesGuard],
  exports: [AuthGuard, RolesGuard, EncryptionModule, TypeOrmModule],
})
export class AuthModule {}
