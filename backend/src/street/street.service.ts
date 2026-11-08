import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { fileTypeFromBuffer } from 'file-type';
import { Street } from '../modules/entities/street.entity.js';
import { StreetImage } from '../modules/entities/street-image.entity.js';
import { StreetCheckIn } from '../modules/entities/street-checkin.entity.js';
import { StreetStatus } from '../modules/enums/street.enums.js';
import { UploadService, type UploadedImage } from '../upload/upload.service.js';
import type { StreetDto } from './dto/street.dto.js';

@Injectable()
export class StreetService {
  constructor(
    @InjectRepository(Street) private readonly streets: Repository<Street>,
    @InjectRepository(StreetCheckIn)
    private readonly checkIns: Repository<StreetCheckIn>,
    private readonly uploadService: UploadService,
  ) {}

  // Only expose public creator fields
  private baseQuery() {
    return this.streets
      .createQueryBuilder('street')
      .leftJoinAndSelect('street.images', 'images')
      .leftJoin('street.createdBy', 'createdBy')
      .addSelect([
        'createdBy.id',
        'createdBy.username',
        'createdBy.profileImageUrl',
      ]);
  }

  async findAllPaginated(page = 1, limit = 10) {
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    const safePage = Math.max(page, 1);

    const [data, total] = await this.baseQuery()
      .where('street.status = :status', { status: StreetStatus.APPROVED })
      .orderBy('street.id', 'DESC')
      .skip((safePage - 1) * safeLimit)
      .take(safeLimit)
      .getManyAndCount();

    return {
      data,
      total,
      page: safePage,
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  async findOne(id: number) {
    const spot = await this.baseQuery()
      .where('street.id = :id AND street.status = :status', {
        id,
        status: StreetStatus.APPROVED,
      })
      .getOne();
    if (!spot) throw new NotFoundException(`Street spot ${id} not found`);
    return spot;
  }

  async findAllAdmin() {
    const data = await this.baseQuery().orderBy('street.id', 'DESC').getMany();
    return { data, total: data.length };
  }

  async findOneAdmin(id: number) {
    const spot = await this.baseQuery()
      .where('street.id = :id', { id })
      .getOne();
    if (!spot) throw new NotFoundException(`Street spot ${id} not found`);
    return spot;
  }

  async create(dto: StreetDto, userId: number, files: UploadedImage[] = []) {
    // Check real file bytes, not the client-supplied mimetype
    const verified: UploadedImage[] = [];
    for (const file of files) {
      const type = await fileTypeFromBuffer(file.buffer);
      if (!type)
        throw new BadRequestException('Unsupported or invalid image file');
      verified.push({
        buffer: file.buffer,
        size: file.size,
        mimetype: type.mime,
      });
    }

    const urls: string[] = [];
    for (const file of verified) {
      urls.push(await this.uploadService.uploadImage('street', file));
    }

    const spot = await this.streets.save(
      this.streets.create({
        ...dto,
        description: dto.description ?? '',
        createdById: userId,
        images: urls.map((url) => ({ url }) as StreetImage),
      }),
    );
    return this.findOneAdmin(spot.id);
  }

  async remove(id: number) {
    const result = await this.streets.delete(id);
    if (!result.affected)
      throw new NotFoundException(`Street spot ${id} not found`);
    return { message: 'Street spot deleted' };
  }

  async updateStatus(id: number, status: StreetStatus) {
    const spot = await this.streets.findOne({ where: { id } });
    if (!spot) throw new NotFoundException(`Street spot ${id} not found`);
    spot.status = status;
    await this.streets.save(spot);
    // TODO: notify the creator once the notification module exists
    return { id, status };
  }

  async getCheckIns(streetId: number) {
    return this.checkIns
      .createQueryBuilder('c')
      .leftJoin('c.user', 'user')
      .addSelect(['user.id', 'user.username', 'user.profileImageUrl'])
      .where('c.streetId = :streetId', { streetId })
      .orderBy('c.createdAt', 'DESC')
      .take(10)
      .getMany();
  }

  async checkIn(streetId: number, userId: number) {
    await this.findOne(streetId); // must exist and be approved
    if (await this.checkIns.findOne({ where: { streetId, userId } })) {
      throw new ConflictException('You have already checked in to this spot');
    }
    return this.checkIns.save(this.checkIns.create({ streetId, userId }));
  }
}
