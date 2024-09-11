import 'reflect-metadata';
import { ProductController } from '../../../infrastructure/web/controllers/products.controller';
import { ProductService } from '../../../infrastructure/services/product.service';
import { Container } from 'typedi';
import { Product } from '../../../domain/entities/product.entity';
import { BadRequestError, NotFoundError } from 'routing-controllers';
import mongoose from 'mongoose';

describe('ProductController', () => {
  let productController: ProductController;
  let mockProductService: jest.Mocked<ProductService>;

  beforeEach(() => {
    mockProductService = {
      getProductById: jest.fn(),
    } as any;
    Container.set(ProductService, mockProductService);
    productController = new ProductController(mockProductService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProduct', () => {
    it('should get a product successfully', async () => {
      const validId = new mongoose.Types.ObjectId().toString();
      const mockProduct = new Product(validId, 'Test Product', 'Description', 100, 10);
      mockProductService.getProductById.mockResolvedValue(mockProduct);

      const result = await productController.getProduct(validId);

      expect(mockProductService.getProductById).toHaveBeenCalledWith(validId);
      expect(result).toEqual(mockProduct);
    });

    it('should handle product not found', async () => {
      const validId = new mongoose.Types.ObjectId().toString();
      mockProductService.getProductById.mockResolvedValue(null);

      await expect(productController.getProduct(validId)).rejects.toThrow(NotFoundError);
    });

    it('should handle invalid product ID', async () => {
      const invalidId = 'invalid-id';
      await expect(productController.getProduct(invalidId)).rejects.toThrow(BadRequestError);
    });

    it('should return all products', async () => {
      const mockProducts = [
        new Product('1', 'Product 1', 'Description', 100, 10),
        new Product('2', 'Product 2', 'Description', 200, 20),
      ];
      mockProductService.getAllProducts.mockResolvedValue(mockProducts);

      const result = await productController.getProducts();

      expect(mockProductService.getAllProducts).toHaveBeenCalled();
      expect(result).toEqual(mockProducts);
    });
    it('should inject Product Controller', () => {
      const productController = Container.get(ProductController);
      expect(productController).toBeInstanceOf(ProductController);
    });
  });
});
