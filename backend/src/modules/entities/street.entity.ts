import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import { User } from './user.entity.js';
import { StreetImage } from './street-image.entity.js';
import {
  BestTime,
  Parking,
  Pedestrians,
  SpotType,
  StreetStatus,
  SurfaceStreetType,
} from '../enums/street.enums.js';

@Entity('streets')
export class Street {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'enum', enum: SpotType })
  spotType: SpotType;

  @Column({ type: 'enum', enum: BestTime })
  bestTimeType: BestTime;

  @Column({ type: 'enum', enum: Parking })
  parkingType: Parking;

  @Column({ type: 'enum', enum: SurfaceStreetType })
  surfaceType: SurfaceStreetType;

  @Column({ type: 'enum', enum: Pedestrians })
  pedestriansType: Pedestrians;

  @Column({ type: 'double precision' })
  latitude: number;

  @Column({ type: 'double precision' })
  longitude: number;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({ type: 'enum', enum: StreetStatus, default: StreetStatus.PENDING })
  status: StreetStatus;

  @Column({ type: 'int', nullable: true })
  createdById: number | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: Relation<User> | null;

  @OneToMany(() => StreetImage, (image) => image.street, {
    cascade: ['insert'],
  })
  images: Relation<StreetImage[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
