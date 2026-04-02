import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreatePaymentDto } from './dtos/create-payment.dto';

type AsaasPaymentStatus =
  | 'PENDING'
  | 'RECEIVED'
  | 'CONFIRMED'
  | 'OVERDUE'
  | 'FAILED'
  | 'REFUNDED'
  | 'CHARGEBACK';

@Injectable()
export class SubscriptionService {
  constructor(private prismaService: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDto) {
    await this.prismaService.subscription.create({
      data: createPaymentDto,
    });
  }

  async getSubscriptionById(subscriptionId: string) {
    return await this.prismaService.subscription.findUnique({
      where: { asaasSubscriptionId: subscriptionId },
    });
  }

  async paymentStatus(
    status: 'PAID' | 'EXPIRED' | 'PENDING',
    subscriptionId: string,
  ) {
    const payment = await this.prismaService.subscription.update({
      where: {
        asaasSubscriptionId: subscriptionId,
      },
      data: {
        status,
      },
    });

    const hasValidPayment = await this.prismaService.subscription.findFirst({
      where: {
        userId: payment.userId,
        status: 'PAID',
      },
    });

    await this.prismaService.user.update({
      where: { id: payment.userId },
      data: {
        active: !!hasValidPayment,
      },
    });
  }
  async validatePayment(paymentId: string, apiKey: string) {
    const response = await fetch(
      `${process.env.ASAAS_API}/payments/${paymentId}`,
      {
        headers: {
          access_token: apiKey,
        },
      },
    );
    const data = (await response.json()) as {
      id: string;
      status: AsaasPaymentStatus;
      subscriptionId: string;
      value: number;
    };

    return data;
  }
}
