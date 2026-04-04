import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from 'src/prisma.service';
import { PaymentProviderService } from 'src/payment-provider/payment-provider.service';
import { BillingService } from 'src/billing/billing.service';
import { NotFoundException } from '@nestjs/common';
import { CreatePaymentProviderOrderDto } from './dtos/create-payment-provider-order.dto';
import { BillingType } from 'src/auth/dto/register-user.dto';
import { PaymentStatus } from '@prisma/client';

describe('OrdersService', () => {
  let ordersService: OrdersService;

  const prismaServiceMock = {
    user: {
      findUnique: jest.fn(),
    },
    order: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    product: {
      findMany: jest.fn(),
    },
  };

  const paymentProviderServiceMock = {
    getDecryptedApiKey: jest.fn(),
  };

  const billingServiceMock = {
    createCustomerWithCharge: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
        {
          provide: PaymentProviderService,
          useValue: paymentProviderServiceMock,
        },
        { provide: BillingService, useValue: billingServiceMock },
      ],
    }).compile();

    ordersService = module.get<OrdersService>(OrdersService);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return an order (OrdersService|order)', async () => {
    const userId = 'user-id';
    const orderId = 'order-id';

    prismaServiceMock.user.findUnique.mockResolvedValue({
      id: 'user-id',
    });
    prismaServiceMock.order.findFirst.mockResolvedValue({ id: 'order-id' });

    await ordersService.order(userId, orderId);

    expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
      where: {
        id: 'user-id',
      },
      select: {
        id: true,
      },
    });
    expect(prismaServiceMock.order.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'order-id',
        buyerId: 'user-id',
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  });

  it('should throw an NotFoundException (OrdersService|order)', async () => {
    const userId = 'user-id';
    const orderId = 'order-id';

    prismaServiceMock.user.findUnique.mockResolvedValue(null);

    await expect(ordersService.order(userId, orderId)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should return user orders (OrdersService|orders)', async () => {
    const params = {
      userId: 'user-id',
    };

    prismaServiceMock.user.findUnique.mockResolvedValue({
      id: 'user-id',
    });
    prismaServiceMock.order.findMany.mockResolvedValue([{}]);

    await ordersService.orders(params);

    expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-id' },
      select: { id: true },
    });
    expect(prismaServiceMock.order.findMany).toHaveBeenCalledWith({
      skip: undefined,
      take: undefined,
      cursor: undefined,
      where: {
        buyerId: 'user-id',
      },
      orderBy: undefined,
      select: {
        id: true,
        status: true,
        total: true,
        asaasPaymentId: true,
        buyer: true,
        seller: true,
        createdAt: true,
        items: {
          select: {
            productId: true,
            quantity: true,
            price: true,
            product: true, // opcional (join)
          },
        },
      },
    });
  });

  it('should throw NotFoundExpection (OrdersService|orders)', async () => {
    const params = {
      userId: 'user-id',
    };

    prismaServiceMock.user.findUnique.mockResolvedValue(null);

    await expect(ordersService.orders(params)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should create payment provider order (OrdersService|createPaymentProviderOrder)', async () => {
    const data: CreatePaymentProviderOrderDto = {
      userId: 'user-id',
      billingType: BillingType.PIX,
      dueDate: new Date(),
      items: [
        {
          productId: 'product-id',
          quantity: 1,
        },
      ],
    };

    prismaServiceMock.user.findUnique.mockResolvedValue({
      id: 'user-id',
    });
    prismaServiceMock.product.findMany.mockResolvedValue([
      {
        id: 'product-id',
        name: 'product',
        stock: 2,
        price: 100,
        userId: 'seller-id',
      },
    ]);
    prismaServiceMock.order.create.mockResolvedValue({
      id: 'order-id',
    });
    paymentProviderServiceMock.getDecryptedApiKey.mockResolvedValue('api-key');
    billingServiceMock.createCustomerWithCharge.mockResolvedValue({
      charge: {
        id: 'charge-id',
        invoiceUrl: 'invoice-url',
      },
    });

    const result = await ordersService.createPaymentProviderOrder(data);

    expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
      where: {
        id: 'user-id',
      },
    });
    expect(prismaServiceMock.product.findMany).toHaveBeenCalledWith({
      where: {
        id: {
          in: ['product-id'],
        },
      },
    });
    expect(prismaServiceMock.order.create).toHaveBeenCalledWith({
      data: {
        buyerId: 'user-id',
        sellerId: 'seller-id',
        total: 100,
        items: {
          create: [{ productId: 'product-id', price: 100, quantity: 1 }],
        },
      },
    });
    expect(paymentProviderServiceMock.getDecryptedApiKey).toHaveBeenCalledWith(
      'seller-id',
    );
    expect(billingServiceMock.createCustomerWithCharge.mock.calls[0][1]).toBe(
      'payment',
    );
    expect(billingServiceMock.createCustomerWithCharge.mock.calls[0][2]).toBe(
      'api-key',
    );
    expect(prismaServiceMock.order.update).toHaveBeenCalledWith({
      data: {
        asaasPaymentId: 'charge-id',
      },
      where: {
        id: 'order-id',
      },
    });
    expect(result).toEqual({
      invoiceUrl: 'invoice-url',
    });
  });
  it('should throw a NotFoundException (OrdersService|createPaymentProviderOrder)', async () => {
    const data: CreatePaymentProviderOrderDto = {
      userId: 'user-id',
      billingType: BillingType.PIX,
      dueDate: new Date(),
      items: [
        {
          productId: 'product-id',
          quantity: 1,
        },
      ],
    };

    prismaServiceMock.user.findUnique.mockResolvedValue(null);

    await expect(
      ordersService.createPaymentProviderOrder(data),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw a NotFoundException (OrdersService|createPaymentProviderOrder)', async () => {
    const data: CreatePaymentProviderOrderDto = {
      userId: 'user-id',
      billingType: BillingType.PIX,
      dueDate: new Date(),
      items: [
        {
          productId: 'product-id',
          quantity: 1,
        },
      ],
    };

    prismaServiceMock.user.findUnique.mockResolvedValue({
      id: 'user-id',
    });
    prismaServiceMock.product.findMany.mockResolvedValue([]);

    await expect(
      ordersService.createPaymentProviderOrder(data),
    ).rejects.toThrow(NotFoundException);
  });
});
