import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import type {
  AccessTokenPayload,
  ResetTokenPayload,
  VerifyEmailTokenPayload,
} from './encryption.interface.js';
import type { UserRole } from '../modules/enums/user-role.enum.js';

@Injectable()
export class EncryptionService {
  private readonly saltRounds: number;

  /** Use this as the cookie maxAge so cookie and token expire together. */
  readonly accessTokenTtlMs: number;

  constructor(
    private readonly jwt: JwtService,
    config: ConfigService,
  ) {
    this.saltRounds = Number(config.get('BCRYPT_SALT_ROUNDS') ?? 12);
    if (Number.isNaN(this.saltRounds)) {
      throw new Error('BCRYPT_SALT_ROUNDS must be a number');
    }

    const ttlSeconds = Number(config.get('JWT_ACCESS_TTL_SECONDS') ?? 86400);
    if (Number.isNaN(ttlSeconds) || ttlSeconds <= 0) {
      throw new Error('JWT_ACCESS_TTL_SECONDS must be a positive number');
    }
    this.accessTokenTtlMs = ttlSeconds * 1000;
  }

  // Passwords

  hash(secret: string): Promise<string> {
    return bcrypt.hash(secret, this.saltRounds);
  }

  comparePassword(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }

  // Access token (stored in the httpOnly cookie)

  generateAccessToken(userId: number, role: UserRole): Promise<string> {
    const payload: AccessTokenPayload = { sub: userId, role, typ: 'access' };
    return this.jwt.signAsync(payload, {
      expiresIn: this.accessTokenTtlMs / 1000,
    });
  }

  async validateAccessToken(token: string): Promise<AccessTokenPayload> {
    const payload = await this.verify<AccessTokenPayload>(token);
    if (payload.typ !== 'access') throw new UnauthorizedException();
    return payload;
  }

  // Password reset (sent by email, never stored in a cookie)

  generateResetToken(userId: number): Promise<string> {
    const payload: ResetTokenPayload = { sub: userId, typ: 'reset' };
    return this.jwt.signAsync(payload, { expiresIn: '15m' });
  }

  async validateResetToken(token: string): Promise<ResetTokenPayload> {
    const payload = await this.verify<ResetTokenPayload>(token);
    if (payload.typ !== 'reset') throw new UnauthorizedException();
    return payload;
  }

  // Email verification (sent by email)

  generateVerifyEmailToken(userId: number): Promise<string> {
    const payload: VerifyEmailTokenPayload = {
      sub: userId,
      typ: 'verify-email',
    };
    return this.jwt.signAsync(payload, { expiresIn: '24h' });
  }

  async validateVerifyEmailToken(
    token: string,
  ): Promise<VerifyEmailTokenPayload> {
    const payload = await this.verify<VerifyEmailTokenPayload>(token);
    if (payload.typ !== 'verify-email') throw new UnauthorizedException();
    return payload;
  }

  private async verify<T extends object>(token: string): Promise<T> {
    try {
      return await this.jwt.verifyAsync<T>(token, { algorithms: ['HS256'] });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
