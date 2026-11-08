import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  BestTime,
  Parking,
  Pedestrians,
  SpotType,
  SurfaceStreetType,
} from '../../modules/enums/street.enums.js';

export class StreetDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsEnum(SpotType)
  spotType: SpotType;

  @IsEnum(BestTime)
  bestTimeType: BestTime;

  @IsEnum(Parking)
  parkingType: Parking;

  @IsEnum(SurfaceStreetType)
  surfaceType: SurfaceStreetType;

  @IsEnum(Pedestrians)
  pedestriansType: Pedestrians;

  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
