import { Injectable } from '@nestjs/common';
import { ClientRegisterDto } from './dtos/client-register.dto';
import {
  Cicly,
  SubscriptionRegisterDto,
} from './dtos/subscription-register.dto';
import { CreatePaymentDto } from './dtos/create-payment.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prismaService: PrismaService) {}

  async client(clientRegisterDto: ClientRegisterDto) {
    const url = `${process.env['ASAAS_API']}/customers`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        access_token: process.env['ASAAS_API_KEY']!,
      },
      body: JSON.stringify(clientRegisterDto),
    });
    const data = (await response.json()) as {
      id: string;
      name: string;
      email: string;
      postalCode: string;
    };
    return data;
  }

  async subscription(subscriptionRegisterDto: SubscriptionRegisterDto) {
    const nextDueDate = new Date(subscriptionRegisterDto.nextDueDate);
    const url = `${process.env['ASAAS_API']}/subscriptions`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        access_token: process.env['ASAAS_API_KEY']!,
      },
      body: JSON.stringify({
        ...subscriptionRegisterDto,
        nextDueDate,
        cicly: Cicly.MONTHLY,
      }),
    });

    const data = (await response.json()) as {
      id: string;
      invoiceUrl: string;
      status: 'PENDIND' | 'PAID' | 'EXPIRED';
    };
    return data;
  }

  async create(createPaymentDto: CreatePaymentDto) {
    await this.prismaService.payment.create({
      data: createPaymentDto,
    });
  }
}
