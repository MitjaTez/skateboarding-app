import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../modules/entities/user.entity.js';
import { EncryptionService } from '../encryption/encryption.service.js';
import { EmailService } from '../email/email.service.js';
import { SignupDto } from './dto/signup.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly emailService: EmailService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async signup(signupData: SignupDto) {
    const { email, username, password, age, hometown, stance } = signupData;
    const normalizedEmail = email.toLowerCase();

    if (
      await this.userRepository.findOne({ where: { email: normalizedEmail } })
    ) {
      throw new ConflictException('This email already exists');
    }
    if (await this.userRepository.findOne({ where: { username } })) {
      throw new ConflictException('This username is taken');
    }

    const newUser = await this.userRepository.save(
      this.userRepository.create({
        username,
        email: normalizedEmail,
        password: await this.encryptionService.hash(password),
        age: age ?? null,
        hometown: hometown ?? null,
        stance,
      }),
    );

    const token = await this.encryptionService.generateVerifyEmailToken(
      newUser.id,
    );
    await this.emailService.sendVerificationEmail(newUser.email, token);

    return {
      message:
        'Registration successful. Please check your email to verify your account.',
    };
  }

  async verifyEmail(token: string) {
    const { sub } =
      await this.encryptionService.validateVerifyEmailToken(token);

    const user = await this.userRepository.findOne({ where: { id: sub } });
    if (!user)
      throw new BadRequestException('Invalid or expired verification token');

    if (!user.isVerified) {
      user.isVerified = true;
      await this.userRepository.save(user);
    }
    return { message: 'Email verified. You can now log in.' };
  }

  async login(credentials: LoginDto) {
    const { email, password } = credentials;

    // password is select:false, so it must be requested explicitly
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email: email.toLowerCase() })
      .getOne();

    if (
      !user ||
      !(await this.encryptionService.comparePassword(password, user.password))
    ) {
      throw new UnauthorizedException('Wrong credentials');
    }
    if (user.isBlocked) {
      throw new ForbiddenException('Your account is blocked');
    }
    if (!user.isVerified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in',
      );
    }

    const accessToken = await this.encryptionService.generateAccessToken(
      user.id,
      user.role,
    );
    return { accessToken };
  }

  getUsers(): Promise<User[]> {
    return this.userRepository.find({ order: { id: 'ASC' } });
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
    if (user) {
      const resetToken = await this.encryptionService.generateResetToken(
        user.id,
      );
      await this.emailService.sendPasswordResetEmail(user.email, resetToken);
    }
    // Same answer whether or not the email exists
    return { message: 'If this user exists, they will receive an email' };
  }

  async resetPassword(
    newPassword: string,
    resetToken: string,
    confirmPassword: string,
  ) {
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const { sub } = await this.encryptionService.validateResetToken(resetToken);

    const user = await this.userRepository.findOne({ where: { id: sub } });
    if (!user) throw new NotFoundException('User not found');

    user.password = await this.encryptionService.hash(newPassword);
    await this.userRepository.save(user);
    return { message: 'Password changed successfully' };
  }

  async blockUser(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.isBlocked)
      throw new BadRequestException('User is already blocked');

    user.isBlocked = true;
    return this.userRepository.save(user);
  }

  async unblockUser(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (!user.isBlocked) throw new BadRequestException('User is not blocked');

    user.isBlocked = false;
    return this.userRepository.save(user);
  }
}
