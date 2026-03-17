import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNumber, IsString } from 'class-validator';

export enum Cicly {
  MONTHLY = 'MONTHLY',
}

export class SubscriptionRegisterDto {
  @IsString()
  customer: string;

  @IsString()
  billingType: string;

  @IsNumber()
  value: number;

  @Type(() => Date)
  @IsDate()
  nextDueDate: Date;

  @IsEnum(Cicly)
  cicly: Cicly;
}
