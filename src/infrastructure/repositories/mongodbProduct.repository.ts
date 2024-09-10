import { Service } from 'typedi';
import { Model, model, Schema } from 'mongoose';
import { Product } from '../../domain/entities/product.entity';
import { ProductRepositoryPort } from '../../application/ports/repositories/product.repository';

const ProductSchema = new Schema({
  name: String,
  description: String,
  price: Number,
  stockQuantity: Number,
});

const ProductModel: Model<Product> = model<Product>('Product', ProductSchema);

@Service()
export class MongoDBProductRepository implements ProductRepositoryPort {
  async findById(id: string): Promise<Product | null> {
    const product = await ProductModel.findById(id);
    return product
      ? new Product(
          product.id,
          product.name,
          product.description,
          product.price,
          product.stockQuantity,
        )
      : null;
  }

  async updateStock(id: string, quantity: number): Promise<void> {
    await ProductModel.findByIdAndUpdate(id, { $inc: { stockQuantity: -quantity } });
  }
}
