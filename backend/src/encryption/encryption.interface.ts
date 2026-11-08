import type { UserRole } from '../modules/enums/user-role.enum.js';

export interface AccessTokenPayload {
  sub: number;
  role: UserRole;
  typ: 'access';
}

export interface ResetTokenPayload {
  sub: number;
  typ: 'reset';
}

export interface VerifyEmailTokenPayload {
  sub: number;
  typ: 'verify-email';
}
