import { IsIn } from 'class-validator';

export class BlockUserDto {
  @IsIn(['block', 'unblock'])
  action: 'block' | 'unblock';
}
