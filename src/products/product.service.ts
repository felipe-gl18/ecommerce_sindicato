import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import * as admin from 'firebase-admin';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async product(slug: string, id: string): Promise<ProductResponseDto | null> {
    const store = await this.prisma.user.findUnique({
      where: { storeSlug: slug },
      select: { id: true },
    });

    if (!store) return null;

    return this.prisma.product.findFirst({
      where: {
        id,
        userId: store.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        amount: true,
        price: true,
        createdAt: true,
        updatedAt: true,
        image: true,
      },
    });
  }
  async products(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ProductWhereUniqueInput;
    slug: string;
    orderBy?: Prisma.ProductOrderByWithRelationInput;
  }): Promise<ProductResponseDto[] | null> {
    const store = await this.prisma.user.findUnique({
      where: { storeSlug: params.slug },
      select: { id: true },
    });

    if (!store) return null;

    return this.prisma.product.findMany({
      skip: params.skip,
      take: params.take,
      cursor: params.cursor,
      where: {
        userId: store.id,
      },
      orderBy: params.orderBy,
      select: {
        id: true,
        name: true,
        description: true,
        amount: true,
        price: true,
        createdAt: true,
        updatedAt: true,
        image: true,
      },
    });
  }

  async createProduct(
    data: CreateProductDto,
    userId: string,
  ): Promise<ProductResponseDto> {
    return this.prisma.product.create({
      data: {
        ...data,
        userId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        amount: true,
        price: true,
        createdAt: true,
        updatedAt: true,
        image: true,
      },
    });
  }

  async updateProduct(params: {
    where: Prisma.ProductWhereUniqueInput;
    data: Prisma.ProductUpdateInput;
  }): Promise<ProductResponseDto> {
    return this.prisma.product.update({
      where: params.where,
      data: params.data,
      select: {
        id: true,
        name: true,
        description: true,
        amount: true,
        price: true,
        createdAt: true,
        updatedAt: true,
        image: true,
      },
    });
  }

  async upload(file: Express.Multer.File, userId: string, productId: string) {
    const store = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        userId,
      },
    });

    if (!store || !product) return null;

    const bucket = admin.storage().bucket();
    const fileName = `images/${store.storeSlug}/${Date.now()}-${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    // if there is an existing image, we just delete it, and upload the new one
    if (product.image) {
      await bucket.file(product.image).delete();
    }

    await fileUpload.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
      },
    });
    const [url] = await fileUpload.getSignedUrl({
      action: 'read',
      expires: '03-09-2491',
    });
    await this.prisma.product.update({
      where: {
        id: productId,
        userId,
      },
      data: {
        image: fileName,
      },
    });
    return { url };
  }

  async deleteProduct(
    where: Prisma.ProductWhereUniqueInput,
  ): Promise<ProductResponseDto> {
    return this.prisma.product.delete({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        amount: true,
        price: true,
        createdAt: true,
        updatedAt: true,
        image: true,
      },
    });
  }
}
