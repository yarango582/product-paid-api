import { ProductService } from '../../../infrastructure/services/product.service';
import { ProductRepositoryPort } from '../../../application/ports/repositories/product.repository';
import { Product } from '../../../domain/entities/product.entity';
import mongoose from 'mongoose';

describe('ProductService', () => {
  let productService: ProductService;
  let productRepositoryMock: jest.Mocked<ProductRepositoryPort>;

  beforeEach(() => {
    productRepositoryMock = {
      findById: jest.fn(),
      updateStock: jest.fn(),
    } as any;

    productService = new ProductService(productRepositoryMock);
  });

  it('debería obtener un producto por ID', async () => {
    const validId = new mongoose.Types.ObjectId().toString();
    const mockProduct = new Product(validId, 'Test Product', 'Description', 100, 10);
    productRepositoryMock.findById.mockResolvedValue(mockProduct);

    const result = await productService.getProductById(validId);
    expect(result).toEqual(mockProduct);
    expect(productRepositoryMock.findById).toHaveBeenCalledWith(validId);
  });

  it('debería actualizar el stock de un producto', async () => {
    const validId = new mongoose.Types.ObjectId().toString();
    await productService.updateProductStock(validId, 5);
    expect(productRepositoryMock.updateStock).toHaveBeenCalledWith(validId, 5);
  });

  it('debería lanzar un error si el ID del producto no es válido', async () => {
    await expect(productService.getProductById('invalid-id')).rejects.toThrow('Invalid product ID');
  });

  it('debería lanzar un error si el ID del producto no es válido al actualizar el stock', async () => {
    await expect(productService.updateProductStock('invalid-id', 5)).rejects.toThrow(
      'Invalid product ID',
    );
  });
});
