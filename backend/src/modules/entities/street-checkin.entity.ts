import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  type Relation,
} from 'typeorm';
import { Street } from './street.entity.js';
import { User } from './user.entity.js';

@Entity('street_check_ins')
@Unique(['streetId', 'userId'])
export class StreetCheckIn {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  streetId: number;

  @Column({ type: 'int' })
  userId: number;

  @ManyToOne(() => Street, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'streetId' })
  street: Relation<Street>;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Relation<User>;

  @CreateDateColumn()
  createdAt: Date;
}
