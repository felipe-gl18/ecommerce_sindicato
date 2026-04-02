import { Injectable } from '@nestjs/common';
import { AsaasService } from 'src/asaas/asaas.service';
import { Cycle } from 'src/asaas/dtos/create-charge.dto';
import { BillingType } from 'src/auth/dto/register-user.dto';

type BillingDto = {
  username: string;
  email: string;
  cpfCnpj: string;
  postalCode: string;
  billingType: BillingType;
  dueDate?: Date;
  nextDueDate?: Date;
  value: number;
  cycle?: Cycle;
};

@Injectable()
export class BillingService {
  constructor(private asaasService: AsaasService) {}
  async createCharge(
    data: BillingDto,
    type: 'subscription' | 'payment',
    apiKey?: string,
  ) {
    // destructure the data to separate the client information from the charge information
    const { username, email, postalCode, cpfCnpj, ...chargeData } = data;
    // 1. creating asaas (payment service) client
    const customer = await this.asaasService.client(
      {
        name: username,
        email,
        postalCode,
        cpfCnpj,
      },
      apiKey,
    );
    // 2. create charge for the client
    const charge = await this.asaasService.charge(
      {
        customer: customer.id,
        ...chargeData,
      },
      type,
      apiKey,
    );
    return {
      customerId: customer.id,
      charge,
    };
  }
}
