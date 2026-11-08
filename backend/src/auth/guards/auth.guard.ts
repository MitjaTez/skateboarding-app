import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EncryptionService } from '../../encryption/encryption.service.js';
import { User } from '../../modules/entities/user.entity.js';
import { AUTH_COOKIE } from '../auth.constants.js';
import type { AuthRequest } from '../decorators/auth-user.decorator.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly encryptionService: EncryptionService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const token = request.cookies?.[AUTH_COOKIE];
    if (!token) throw new UnauthorizedException('Please log in');

    // throws 401 if the token is invalid, expired or the wrong type
    const payload = await this.encryptionService.validateAccessToken(token);

    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });
    if (!user) throw new UnauthorizedException('User not found');
    if (user.isBlocked) throw new ForbiddenException('Your account is blocked');

    request.user = user;
    return true;
  }
}
