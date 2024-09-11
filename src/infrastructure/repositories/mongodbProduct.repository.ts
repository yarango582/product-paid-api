import { Service } from 'typedi';
import { Model, model, Schema } from 'mongoose';
import { Product } from '../../domain/entities/product.entity';
import { ProductRepositoryPort } from '../../application/ports/repositories/product.repository';

const ProductSchema = new Schema(
  {
    name: String,
    description: String,
    price: Number,
    stockQuantity: Number,
    publicImageURL: { type: String, default: '' },
  },
  {
    timestamps: true,
  },
);

const ProductModel: Model<Product> = model<Product>('Product', ProductSchema);

@Service('ProductRepositoryPort')
export class MongoDBProductRepository implements ProductRepositoryPort {
  async findById(id: string): Promise<Product | null> {
    const product = await ProductModel.findById(id);
    return product
      ? new Product(
          product._id.toString(),
          product.name,
          product.description,
          product.price,
          product.stockQuantity,
          product.publicImageURL,
        )
      : null;
  }

  async updateStock(id: string, quantity: number): Promise<void> {
    await ProductModel.findByIdAndUpdate(id, { $inc: { stockQuantity: -quantity } });
  }

  async create(productData: Omit<Product, 'id'>): Promise<Product> {
    const createdProduct = await ProductModel.create(productData);
    return new Product(
      createdProduct._id.toString(),
      createdProduct.name,
      createdProduct.description,
      createdProduct.price,
      createdProduct.stockQuantity,
      createdProduct.publicImageURL,
    );
  }

  async findByName(name: string): Promise<Product | null> {
    const product = await ProductModel.findOne({ name }).lean();
    return product
      ? new Product(
          product._id.toString(),
          product.name,
          product.description,
          product.price,
          product.stockQuantity,
          product.publicImageURL,
        )
      : null;
  }
  async findAll(): Promise<Product[]> {
    const products = await ProductModel.find();
    return products.map(
      (product) =>
        new Product(
          product._id.toString(),
          product.name,
          product.description,
          product.price,
          product.stockQuantity,
          product.publicImageURL,
        ),
    );
  }
}
