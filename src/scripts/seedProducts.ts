import mongoose from 'mongoose';
import { config } from 'dotenv';
import { Product } from '../domain/entities/product.entity';
import { MongoDBProductRepository } from '../infrastructure/repositories/mongodbProduct.repository';
import logger from '../config/logger';

config();

const products = [
  {
    name: 'Audifonos Inalámbricos',
    description: 'Auriculares con cancelación de ruido',
    price: 299900,
    stockQuantity: 50,
    publicImageURL:
      'https://img.freepik.com/foto-gratis/vida-muerta-auriculares-ciberneticos-inalambricos_23-2151072201.jpg?t=st=1726008920~exp=1726012520~hmac=f963633a0d7b907decb8117111835983842f908ed59fd60335dd2afb74d92255&w=740',
  },
  {
    name: 'Smartwatch',
    description: 'Reloj inteligente con monitor de ritmo cardíaco',
    price: 499900,
    stockQuantity: 30,
    publicImageURL:
      'https://img.freepik.com/foto-gratis/tecnologia-portatil-reloj-inteligente-holograma-futurista_53876-108508.jpg?t=st=1726008986~exp=1726012586~hmac=17098c5d3fcd639cc36273548d232fde31b190dbc7d7ca4f1eabcec04ee2fb82&w=1380',
  },
  {
    name: 'Cámara Digital',
    description: 'Cámara compacta de 20MP con zoom óptico 10x',
    price: 799900,
    stockQuantity: 20,
    publicImageURL:
      'https://img.freepik.com/foto-gratis/camara-fotos-explotacion-mano_23-2150630970.jpg?t=st=1726009043~exp=1726012643~hmac=fbf9b41fa7fb0582f01a377932f48f07bbffce4a2116ffd2bc430e534b911507&w=740',
  },
  {
    name: 'Portátil Ultraligero',
    description: 'Laptop de 13 pulgadas con 16GB RAM y SSD de 512GB',
    price: 2499900,
    stockQuantity: 15,
    publicImageURL:
      'https://img.freepik.com/foto-gratis/mano-mujer-sosteniendo-taza-cafe-desechable-escribiendo-computadora-portatil_23-2147971687.jpg?t=st=1726009151~exp=1726012751~hmac=0e66cab88a9bd6366ed4417483e5b1e2a8312ec59628ce2b0bf5a60f83d28efb&w=1380',
  },
  {
    name: 'Altavoz Inteligente',
    description: 'Altavoz con asistente de voz integrado',
    price: 199900,
    stockQuantity: 40,
    publicImageURL:
      'https://img.freepik.com/foto-gratis/dispositivo-electronico-mesa_417767-143.jpg?t=st=1726009211~exp=1726012811~hmac=0459977a1d090a7212ccc6269a64239d5655e39e7c51914fbf43c03f41289682&w=1380',
  },
];

export async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    logger.info('Connected to MongoDB');

    const productRepository = new MongoDBProductRepository();

    for (const productData of products) {
      const existingProduct = await productRepository.findByName(productData.name);
      if (!existingProduct) {
        const _id = new mongoose.Types.ObjectId().toHexString();
        const product = new Product(
          _id,
          productData.name,
          productData.description,
          productData.price,
          productData.stockQuantity,
          productData.publicImageURL,
        );

        await productRepository.create(product);
        logger.info(`Created product: ${product.name}`);
      }
    }

    logger.info('Seed completed successfully');
  } catch (error) {
    logger.error('Error seeding products:', error);
  } finally {
    await mongoose.connection.close();
  }
}

seedProducts();
