import {
  JsonController,
  Get,
  Param,
  BadRequestError,
  NotFoundError,
  HttpCode,
} from 'routing-controllers';
import { ProductService } from '../../services/product.service';
import { Inject, Service } from 'typedi';
import { isValidObjectId } from 'mongoose';
import { Product } from '../../../domain/entities/product.entity';

@JsonController('/products')
@Service()
export class ProductController {
  constructor(@Inject(() => ProductService) private productService: ProductService) {}

  @Get('/:id')
  @HttpCode(200)
  async getProduct(@Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestError('Invalid product ID');
    }
    const product = await this.productService.getProductById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    return product;
  }
  @Get('/')
  @HttpCode(200)
  async getProducts(): Promise<Product[]> {
    try {
      return this.productService.getAllProducts();
    } catch (error: any) {
      throw new Error(error?.message || 'Internal server error');
    }
  }
}
