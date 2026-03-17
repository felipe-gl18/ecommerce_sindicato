import { Body, Controller, Post } from '@nestjs/common';
import { AsaasService } from './asaas.service';

type Webhook = {
  event:
    | 'PAYMENT_CONFIRMED'
    | 'PAYMENT_RECEIVED'
    | 'PAYMENT_OVERDUE'
    | 'PAYMENT_REFUNDED'
    | 'PAYMENT_FAILED'
    | 'PAYMENT_CHARGEBACK_DONE';
  payment: {
    id: string;
  };
};

@Controller('webhook/asaas')
export class AsaasWebhook {
  constructor(private asaasService: AsaasService) {}
  @Post()
  async handle(
    @Body()
    body: Webhook,
  ) {
    const { event, payment } = body;
    if (event === 'PAYMENT_CONFIRMED')
      await this.asaasService.paymentStatus('PAID', payment.id);
    if (event === 'PAYMENT_RECEIVED')
      await this.asaasService.paymentStatus('PAID', payment.id);
    if (event === 'PAYMENT_OVERDUE')
      await this.asaasService.paymentStatus('EXPIRED', payment.id);
    if (event === 'PAYMENT_REFUNDED')
      await this.asaasService.paymentStatus('EXPIRED', payment.id);
    if (event === 'PAYMENT_FAILED')
      await this.asaasService.paymentStatus('EXPIRED', payment.id);
    if (event === 'PAYMENT_CHARGEBACK_DONE')
      await this.asaasService.paymentStatus('EXPIRED', payment.id);
    return { received: true };
  }
}
