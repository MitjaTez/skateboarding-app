import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../modules/entities/user.entity.js';
import { UploadService, type UploadedImage } from '../upload/upload.service.js';
import type { EditUserDto } from './dto/edit-user.dto.js';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly uploadService: UploadService,
  ) {}

  async editUser(userId: number, dto: EditUserDto, file?: UploadedImage) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const { deleteImage, ...fields } = dto;

    if (fields.username && fields.username !== user.username) {
      const taken = await this.userRepository.findOne({
        where: { username: fields.username },
      });
      if (taken) throw new ConflictException('This username is taken');
    }

    Object.assign(user, fields);

    if (file) {
      user.profileImageUrl = await this.uploadService.uploadImage(
        'avatars',
        file,
      );
    } else if (deleteImage) {
      user.profileImageUrl = null;
    }

    const saved = await this.userRepository.save(user);
    return {
      id: saved.id,
      username: saved.username,
      age: saved.age,
      hometown: saved.hometown,
      stance: saved.stance,
      profileImage: saved.profileImageUrl,
    };
  }

  async deleteUser(userId: number) {
    const result = await this.userRepository.delete(userId);
    if (!result.affected) throw new NotFoundException('User not found');
    return { message: 'User deleted successfully' };
  }

  /* ------------------------------- Admin only ----------------------------- */

  findAll() {
    return this.userRepository.find({
      select: {
        id: true,
        username: true,
        email: true,
        age: true,
        hometown: true,
        stance: true,
        role: true,
        isBlocked: true,
        profileImageUrl: true,
      },
      order: { id: 'ASC' },
    });
  }

  async setBlocked(adminId: number, userId: number, blocked: boolean) {
    if (adminId === userId) {
      throw new BadRequestException("You can't block yourself");
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    user.isBlocked = blocked;
    await this.userRepository.save(user);
    return { id: userId, isBlocked: blocked };
  }

  async deleteUserAsAdmin(adminId: number, userId: number) {
    if (adminId === userId) {
      throw new BadRequestException("You can't delete yourself here");
    }
    return this.deleteUser(userId);
  }
}
