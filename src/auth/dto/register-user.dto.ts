/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @MinLength(6, { message: 'Username must be at least 6 characters long' })
  @MaxLength(20, { message: 'Username must be at most 20 characters long' })
  username: string;

  @IsEmail()
  @MinLength(6, { message: 'Email must be at least 6 characters long' })
  @MaxLength(50, { message: 'Email must be at most 50 characters long' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(20, { message: 'Password must be at most 20 characters long' })
  password: string;
}
