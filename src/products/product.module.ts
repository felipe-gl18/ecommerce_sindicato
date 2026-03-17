import { Module } from '@nestjs/common';
import { ProductsService } from './product.service';
import { ProductController } from './product.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [],
  providers: [ProductsService, PrismaService],
  controllers: [ProductController],
  exports: [ProductsService],
})
export class ProductsModule {}
