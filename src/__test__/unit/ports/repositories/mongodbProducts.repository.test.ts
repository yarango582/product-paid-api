import { MongoDBProductRepository } from '../../../../infrastructure/repositories/mongodbProduct.repository';
import { Product } from '../../../../domain/entities/product.entity';

jest.mock('mongoose', () => {
  const mockedMongoose = jest.requireActual('mongoose');

  const mockProductModel = {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn().mockReturnThis(),
    lean: jest.fn(),
  };

  return {
    ...mockedMongoose,
    model: jest.fn(() => mockProductModel),
    Schema: mockedMongoose.Schema,
  };
});

describe('MongoDBProductRepository', () => {
  let repository: MongoDBProductRepository;
  let mockProductModel: any;

  beforeEach(() => {
    jest.clearAllMocks();
    // Retrieve the mock implementation from the jest mock
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    mockProductModel = require('mongoose').model();
    repository = new MongoDBProductRepository();
  });

  it('should find a product by id', async () => {
    const mockProduct = {
      _id: '1',
      name: 'Test Product',
      description: 'Test Description',
      price: 100,
      stockQuantity: 10,
      publicImageURL: 'http://example.com/image.jpg',
    };
    mockProductModel.findById.mockResolvedValue(mockProduct);

    const result = await repository.findById('1');

    expect(mockProductModel.findById).toHaveBeenCalledWith('1');
    expect(result).toBeInstanceOf(Product);
    expect(result).toEqual(
      new Product('1', 'Test Product', 'Test Description', 100, 10, 'http://example.com/image.jpg'),
    );
  });

  it('should update product stock', async () => {
    await repository.updateStock('1', 5);

    expect(mockProductModel.findByIdAndUpdate).toHaveBeenCalledWith('1', {
      $inc: { stockQuantity: -5 },
    });
  });

  it('should create a product', async () => {
    const productData = {
      name: 'New Product',
      description: 'New Description',
      price: 200,
      stockQuantity: 20,
      publicImageURL: 'http://example.com/new-image.jpg',
    };
    const mockCreatedProduct = { _id: '2', ...productData };
    mockProductModel.create.mockResolvedValue(mockCreatedProduct);

    const result = await repository.create(productData);

    expect(mockProductModel.create).toHaveBeenCalledWith(productData);
    expect(result).toBeInstanceOf(Product);
    expect(result).toEqual(
      new Product(
        '2',
        'New Product',
        'New Description',
        200,
        20,
        'http://example.com/new-image.jpg',
      ),
    );
  });

  it('should find a product by name', async () => {
    const mockProduct = {
      _id: '3',
      name: 'Test Product',
      description: 'Test Description',
      price: 150,
      stockQuantity: 15,
      publicImageURL: 'http://example.com/test-image.jpg',
    };
    mockProductModel.findOne.mockReturnThis();
    mockProductModel.lean.mockResolvedValue(mockProduct);

    const result = await repository.findByName('Test Product');

    expect(mockProductModel.findOne).toHaveBeenCalledWith({ name: 'Test Product' });
    expect(result).toBeInstanceOf(Product);
    expect(result).toEqual(
      new Product(
        '3',
        'Test Product',
        'Test Description',
        150,
        15,
        'http://example.com/test-image.jpg',
      ),
    );
  });
});
