import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { StreetService } from './street.service.js';
import { StreetDto } from './dto/street.dto.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { AdminOnly } from '../auth/decorators/roles.decorator.js';
import { AuthUser } from '../auth/decorators/auth-user.decorator.js';
import { User } from '../modules/entities/user.entity.js';
import { StreetStatus } from '../modules/enums/street.enums.js';
import type { UploadedImage } from '../upload/upload.service.js';

@Controller('street')
export class StreetController {
  constructor(private readonly streetService: StreetService) {}

  @Get()
  getAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.streetService.findAllPaginated(page, limit);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @AdminOnly()
  @Get('admin/all')
  getAllAdmin() {
    return this.streetService.findAllAdmin();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @AdminOnly()
  @Get('admin/:id')
  getOneAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.streetService.findOneAdmin(id);
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.streetService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'images', maxCount: 4 }], {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  create(
    @Body() dto: StreetDto,
    @AuthUser() user: User,
    @UploadedFiles() files: { images?: UploadedImage[] },
  ) {
    return this.streetService.create(dto, user.id, files?.images ?? []);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @AdminOnly()
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.streetService.remove(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @AdminOnly()
  @Patch(':id/approve')
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.streetService.updateStatus(id, StreetStatus.APPROVED);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @AdminOnly()
  @Patch(':id/decline')
  decline(@Param('id', ParseIntPipe) id: number) {
    return this.streetService.updateStatus(id, StreetStatus.REJECTED);
  }

  @Get(':id/check-ins')
  getCheckIns(@Param('id', ParseIntPipe) id: number) {
    return this.streetService.getCheckIns(id);
  }

  @UseGuards(AuthGuard)
  @Post(':id/check-ins')
  checkIn(@Param('id', ParseIntPipe) id: number, @AuthUser() user: User) {
    return this.streetService.checkIn(id, user.id);
  }
}
