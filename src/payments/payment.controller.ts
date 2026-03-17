import { Body, Controller, Post } from '@nestjs/common';
import { ClientRegisterDto } from './dtos/client-register.dto';
import { ValidationPipe } from 'src/validation.pipe';
import { PaymentsService } from './payment.service';
import { SubscriptionRegisterDto } from './dtos/subscription-register.dto';

@Controller('payments')
export class PaymentController {
  constructor(private paymentService: PaymentsService) {}
  @Post('client')
  async register(
    @Body(new ValidationPipe()) clientRegisterDto: ClientRegisterDto,
  ) {
    return await this.paymentService.client(clientRegisterDto);
  }

  @Post('charge')
  async charge(
    @Body(new ValidationPipe())
    subscriptionRegisterDto: SubscriptionRegisterDto,
  ) {
    return await this.paymentService.subscription(subscriptionRegisterDto);
  }
}
