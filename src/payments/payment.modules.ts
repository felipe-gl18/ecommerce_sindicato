import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentsService } from './payment.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [],
  providers: [PaymentsService, PrismaService],
  controllers: [PaymentController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
