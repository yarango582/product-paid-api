import { JsonController, Get, Param, BadRequestError, NotFoundError } from 'routing-controllers';
import { ProductService } from '../../services/product.service';
import { Inject, Service } from 'typedi';
import { isValidObjectId } from 'mongoose';

@JsonController('/products')
@Service()
export class ProductController {
  constructor(@Inject(() => ProductService) private productService: ProductService) {}

  @Get('/:id')
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
}
