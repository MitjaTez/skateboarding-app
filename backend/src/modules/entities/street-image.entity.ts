import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Street } from './street.entity.js';

@Entity('street_images')
export class StreetImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  url: string;

  @ManyToOne(() => Street, (street) => street.images, { onDelete: 'CASCADE' })
  street: Relation<Street>;
}
