import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Stance } from '../../modules/enums/stance.enum.js';

export class SignupDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be valid' })
  email: string;

  @IsNotEmpty({ message: 'Username is required' })
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters' })
  @MaxLength(30, { message: 'Username must be at most 30 characters' })
  username: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(72, { message: 'Password must be at most 72 characters' })
  password: string;

  @IsOptional()
  @IsInt({ message: 'Age must be a whole number' })
  @Min(5)
  @Max(120)
  age?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  hometown?: string;

  @IsOptional()
  @IsEnum(Stance, { message: 'Stance must be REGULAR or GOOFY' })
  stance?: Stance;
}
