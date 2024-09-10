import { Inject, Service } from 'typedi';
import { ProductRepositoryPort } from '../../application/ports/repositories/product.repository';
import { isValidObjectId } from 'mongoose';

@Service()
export class ProductService {
  constructor(@Inject('ProductRepositoryPort') private productRepository: ProductRepositoryPort) {}

  async getProductById(id: string) {
    if (!isValidObjectId(id)) {
      throw new Error('Invalid product ID');
    }
    return this.productRepository.findById(id);
  }

  async updateProductStock(id: string, quantity: number) {
    if (!isValidObjectId(id)) {
      throw new Error('Invalid product ID');
    }
    return this.productRepository.updateStock(id, quantity);
  }
}
