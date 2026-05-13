import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateOrderDto } from './dtos/create-order.dto';
import { SellerGuard } from 'src/auth/seller.guard';
import { ProductsService } from 'src/products/product.service';
import { SubscriptionGuard } from 'src/subscription/subscription.guard';

@Controller('orders')
export class OrdersController {
  constructor(
    private ordersService: OrdersService,
    private productsService: ProductsService,
  ) {}

  @Get('')
  @UseGuards(AuthGuard)
  async orders(@Request() req: Request) {
    const user = req['user'] as { sub: string };

    const orders = await this.ordersService.orders({
      userId: user.sub,
    });

    const ordersWithImage = await Promise.all(
      orders.map(async (order) => {
        const items = await Promise.all(
          order.items.map(async (item) => ({
            ...item,
            product: {
              ...item.product,
              image: (
                await this.productsService.getProductImageUrl(item.product.id)
              ).url,
            },
          })),
        );

        return {
          ...order,
          items,
        };
      }),
    );

    return ordersWithImage;
  }

  @Get('seller-orders')
  @UseGuards(AuthGuard, SellerGuard, SubscriptionGuard)
  async sellerOrders(@Request() req: Request) {
    const seller = req['user'] as { sub: string };
    return await this.ordersService.sellerOrders({ userId: seller.sub });
  }

  @Get('seller-orders/:id')
  @UseGuards(AuthGuard, SellerGuard, SubscriptionGuard)
  async sellerOrder(@Request() req: Request, @Param('id') id: string) {
    const seller = req['user'] as { sub: string };
    const order = await this.ordersService.sellerOrder(seller.sub, id);
    const orderItems = await Promise.all(
      order!.items.map(async (item) => {
        const { url } = await this.productsService.getProductImageUrl(
          item.productId,
        );
        return {
          ...item,
          product: {
            image: url,
          },
        };
      }),
    );
    return { ...order, items: orderItems };
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async order(@Request() req: Request, @Param('id') id: string) {
    const user = req['user'] as { sub: string };
    return await this.ordersService.order(user.sub, id);
  }

  @Post('')
  @UseGuards(AuthGuard, SubscriptionGuard)
  async create(
    @Body(new ValidationPipe()) createOrderDto: CreateOrderDto,
    @Request() req: Request,
  ) {
    const user = req['user'] as { sub: string };
    return await this.ordersService.createPaymentProviderOrder({
      ...createOrderDto,
      userId: user.sub,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
    });
  }
  @Delete(':id')
  @UseGuards(AuthGuard, SubscriptionGuard)
  async delete(@Request() req: Request, @Param('id') id: string) {
    const user = req['user'] as { sub: string };
    return await this.ordersService.delete(user.sub, id);
  }
}
