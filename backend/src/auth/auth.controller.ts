import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service.js';
import { EncryptionService } from '../encryption/encryption.service.js';
import { SignupDto } from './dto/signup.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { AuthGuard } from './guards/auth.guard.js';
import { AuthUser } from './decorators/auth-user.decorator.js';
import { User } from '../modules/entities/user.entity.js';
import { AUTH_COOKIE } from './auth.constants.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { RolesGuard } from './guards/roles.guard.js';
import { AdminOnly } from './decorators/roles.decorator.js';

const cookieOptions = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production',
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly encryptionService: EncryptionService,
  ) {}

  @Post('signup')
  signUp(@Body() signupData: SignupDto) {
    return this.authService.signup(signupData);
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() credentials: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken } = await this.authService.login(credentials);
    res.cookie(AUTH_COOKIE, accessToken, {
      ...cookieOptions,
      maxAge: this.encryptionService.accessTokenTtlMs,
    });
    return { message: 'Login successful' };
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(AUTH_COOKIE, cookieOptions);
    return { message: 'Logged out' };
  }

  @UseGuards(AuthGuard)
  @Get('me')
  me(@AuthUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      age: user.age,
      hometown: user.hometown,
      stance: user.stance,
      role: user.role,
      profileImage: user.profileImageUrl,
    };
  }
  @Get('verify-email')
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('forgot-password')
  @HttpCode(200)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Put('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(
      dto.newPassword,
      dto.resetToken,
      dto.confirmPassword,
    );
  }

  @UseGuards(AuthGuard, RolesGuard)
  @AdminOnly()
  @Get('users')
  getUsers() {
    return this.authService.getUsers();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @AdminOnly()
  @Patch('block/:id')
  blockUser(@Param('id', ParseIntPipe) id: number, @AuthUser() admin: User) {
    if (id === admin.id) {
      throw new BadRequestException('Admin cannot block themselves');
    }
    return this.authService.blockUser(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @AdminOnly()
  @Patch('unblock/:id')
  unblockUser(@Param('id', ParseIntPipe) id: number) {
    return this.authService.unblockUser(id);
  }
}
