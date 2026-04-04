import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';

class OrderItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  price: number;

  @IsNumber()
  quantity: number;
}

export class OrderDto {
  @IsString()
  buyerId: string;

  @IsString()
  sellerId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsString()
  asaasPaymentId?: string;

  @IsNumber()
  total: number;
}
