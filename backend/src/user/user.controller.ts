import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { UserService } from './user.service.js';
import { EditUserDto } from './dto/edit-user.dto.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { AdminOnly } from '../auth/decorators/roles.decorator.js';
import { AuthUser } from '../auth/decorators/auth-user.decorator.js';
import { User } from '../modules/entities/user.entity.js';
import { AUTH_COOKIE } from '../auth/auth.constants.js';
import type { UploadedImage } from '../upload/upload.service.js';

@Controller('user')
@UseGuards(AuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('me')
  @UseInterceptors(
    FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  editMe(
    @AuthUser() user: User,
    @Body() dto: EditUserDto,
    @UploadedFile() file?: UploadedImage,
  ) {
    return this.userService.editUser(user.id, dto, file);
  }

  @Delete('me')
  @HttpCode(200)
  async deleteMe(
    @AuthUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.userService.deleteUser(user.id);
    res.clearCookie(AUTH_COOKIE);
    return result;
  }

  /*  Admin only  */

  @Get()
  @AdminOnly()
  findAll() {
    return this.userService.findAll();
  }

  @Patch(':id/block')
  @AdminOnly()
  block(@AuthUser() admin: User, @Param('id', ParseIntPipe) id: number) {
    return this.userService.setBlocked(admin.id, id, true);
  }

  @Patch(':id/unblock')
  @AdminOnly()
  unblock(@AuthUser() admin: User, @Param('id', ParseIntPipe) id: number) {
    return this.userService.setBlocked(admin.id, id, false);
  }

  @Delete(':id')
  @HttpCode(200)
  @AdminOnly()
  removeUser(@AuthUser() admin: User, @Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteUserAsAdmin(admin.id, id);
  }
}
