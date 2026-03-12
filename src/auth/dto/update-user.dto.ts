/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MinLength(6)
  @MaxLength(20)
  username?: string;

  @IsEmail()
  @IsOptional()
  @MinLength(6)
  @MaxLength(50)
  email?: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  @MaxLength(20)
  password?: string;
}
