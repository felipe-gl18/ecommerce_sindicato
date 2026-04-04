import {
  Body,
  Controller,
  Delete,
  Post,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { PaymentProviderDto } from './dtos/payment-provider.dto';
import { SellerGuard } from 'src/auth/seller.guard';
import { AuthGuard } from 'src/auth/auth.guard';
import { PaymentProviderService } from './payment-provider.service';
import { SubscriptionGuard } from 'src/subscription/subscription.guard';

@Controller('payment-provider')
export class PaymentProviderController {
  constructor(private paymentProviderService: PaymentProviderService) {}

  @Post('seller-payment-account')
  @UseGuards(AuthGuard, SellerGuard, SubscriptionGuard)
  async createSellerPaymentAccount(
    @Body(new ValidationPipe())
    paymentProviderDto: PaymentProviderDto,
    @Request() req: Request,
  ) {
    const user = req['user'] as { sub: string };
    return await this.paymentProviderService.connect(
      user.sub,
      paymentProviderDto.apiKey,
      paymentProviderDto.provider,
    );
  }

  @Delete('seller-payment-account')
  @UseGuards(AuthGuard, SellerGuard, SubscriptionGuard)
  async deleteSellerPaymentAccount(@Request() req: Request) {
    const user = req['user'] as { sub: string };
    return await this.paymentProviderService.disconnect(user.sub);
  }
}
