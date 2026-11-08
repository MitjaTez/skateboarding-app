import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';

export interface UploadedImage {
  mimetype: string;
  size: number;
  buffer: Buffer;
}

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

@Injectable()
export class UploadService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  constructor(config: ConfigService) {
    this.bucketName = config.getOrThrow<string>('AWS_S3_BUCKET');
    this.region = config.getOrThrow<string>('AWS_S3_REGION');
    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: config.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: config.getOrThrow<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  /** Validates, uploads under a generated key, returns the public URL. */
  async uploadImage(folder: string, file: UploadedImage): Promise<string> {
    const ext = ALLOWED_IMAGE_TYPES[file.mimetype];
    if (!ext) {
      throw new BadRequestException(
        'Only JPEG, PNG or WebP images are allowed',
      );
    }
    if (file.size > MAX_IMAGE_BYTES) {
      throw new BadRequestException('Image must be under 5 MB');
    }

    const key = `${folder}/${randomUUID()}.${ext}`;
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );
    return this.getUrl(key);
  }

  getUrl(key: string): string {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
  }
}
