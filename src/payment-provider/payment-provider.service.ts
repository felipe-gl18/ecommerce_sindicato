import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CryptoService } from 'src/crypto/crypto.service';
import { PrismaService } from 'src/prisma.service';
import { SellerPaymentProvider } from './dtos/payment-provider.dto';
import { PaymentGatewayService } from 'src/payment-gateway/payment-gateway.service';

@Injectable()
export class PaymentProviderService {
  constructor(
    private cryptoService: CryptoService,
    private prismaService: PrismaService,
    private paymentGatewayService: PaymentGatewayService,
  ) {}
  async connect(
    userId: string,
    apiKey: string,
    provider: SellerPaymentProvider,
  ) {
    try {
      const encryptedApiKey = this.cryptoService.encrypt(apiKey);
      // create webhook for the seller payment provider
      await this.paymentGatewayService.createWebhook(apiKey);
      // using upsert to create or update the seller payment account for the user
      return await this.prismaService.sellerPaymentAccount.upsert({
        where: {
          userId,
        },
        update: { encryptedApiKey },
        create: {
          userId,
          provider: provider,
          encryptedApiKey,
        },
        select: {
          provider: true,
          isActive: true,
        },
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }

      throw new InternalServerErrorException(
        'Failed to connect payment provider',
      );
    }
  }
  async disconnect(userId: string) {
    try {
      return await this.prismaService.sellerPaymentAccount.update({
        where: {
          userId,
        },
        data: {
          isActive: false,
        },
      });
    } catch (error) {
      if (error instanceof Error) throw new Error(error.message);
      throw new InternalServerErrorException(
        'Failed to disconnect payment provider',
      );
    }
  }
  async getByUserId(userId: string) {
    try {
      return await this.prismaService.sellerPaymentAccount.findUnique({
        where: {
          userId,
        },
      });
    } catch (error) {
      if (error instanceof Error) throw new Error(error.message);
      throw new InternalServerErrorException(
        'Failed to get payment provider by user id ',
      );
    }
  }
  async getDecryptedApiKey(userId: string) {
    try {
      const account = await this.getByUserId(userId);
      if (!account || !account.isActive) {
        throw new BadRequestException('Seller payment account not connected');
      }
      return this.cryptoService.decrypt(account.encryptedApiKey);
    } catch (error) {
      if (error instanceof Error) throw new Error(error.message);
      throw new InternalServerErrorException(
        'Failed to get payment provider decryted api key',
      );
    }
  }
}
