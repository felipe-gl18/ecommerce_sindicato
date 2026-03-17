import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AsaasService {
  constructor(private prismaService: PrismaService) {}
  async paymentStatus(
    status: 'PAID' | 'EXPIRED' | 'PENDING',
    paymentId: string,
  ) {
    const payment = await this.prismaService.payment.update({
      where: {
        asaasPaymentId: paymentId,
      },
      data: {
        status,
      },
    });

    const hasValidPayment = await this.prismaService.payment.findFirst({
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
}
