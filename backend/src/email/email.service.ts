import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly emailFrom: string;
  private readonly frontendUrl: string;

  constructor(config: ConfigService) {
    this.resend = new Resend(config.getOrThrow<string>('RESEND_API_KEY'));
    this.emailFrom =
      config.get<string>('EMAIL_FROM') ?? 'onboarding@resend.dev';
    this.frontendUrl =
      config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const url = `${this.frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;
    await this.send(
      email,
      'Password Reset Request',
      `<p>Hello!</p>
       <p>Click the link below to reset your password (valid for 15 minutes):</p>
       <a href="${url}">${url}</a>
       <p>If you didn’t request this, ignore this email.</p>`,
      'Error sending password reset email',
    );
  }

  async sendVerificationEmail(email: string, token: string) {
    const url = `${this.frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;
    await this.send(
      email,
      'Verify your email address',
      `<p>Hello!</p>
       <p>Thanks for signing up. Please verify your email address:</p>
       <a href="${url}">${url}</a>
       <p>This link will expire in 24 hours.</p>
       <p>If you didn't create an account, you can ignore this email.</p>`,
      'Error sending verification email',
    );
  }

  private async send(
    to: string,
    subject: string,
    html: string,
    errorMessage: string,
  ) {
    const { error } = await this.resend.emails.send({
      from: this.emailFrom,
      to,
      subject,
      html,
    });
    if (error) {
      this.logger.error(`Resend error: ${error.message}`);
      throw new InternalServerErrorException(errorMessage);
    }
  }
}
