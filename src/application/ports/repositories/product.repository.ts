import { Product } from '../../../domain/entities/product.entity';

export interface ProductRepositoryPort {
  findById(id: string): Promise<Product | null>;
  updateStock(id: string, quantity: number): Promise<void>;
  findAll(): Promise<Product[]>;
}
