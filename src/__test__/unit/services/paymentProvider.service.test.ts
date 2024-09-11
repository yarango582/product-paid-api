import { ProviderPaymentService } from '../../../infrastructure/services/paymentProvider.service';
import axios from 'axios';
import logger from '../../../config/logger';

jest.mock('axios');
jest.mock('../../../config/logger');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ProviderPaymentService', () => {
  let providerPaymentService: ProviderPaymentService;

  beforeEach(() => {
    providerPaymentService = new ProviderPaymentService();
    jest.clearAllMocks();
  });

  it('debería procesar un pago exitosamente', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { data: { presigned_acceptance: { acceptance_token: 'acceptance_token' } } },
    });

    // Simular un pago inicialmente PENDING
    mockedAxios.post.mockResolvedValueOnce({
      data: { data: { status: 'PENDING', id: 'ext123' } },
    });

    // Simular que el pago se aprueba después de la validación
    mockedAxios.get.mockResolvedValue({
      data: { data: { status: 'APPROVED' } },
    });

    const result = await providerPaymentService.processPayment('123', 100, {
      email: 'test@example.com',
      token: 'cardToken',
    });

    expect(result.status).toBe('APPROVED');
    expect(result.externalTransactionId).toBe('ext123');
    expect(result.internalTransactionId).toBe('123');
    expect(result.amount).toBe(100);
    expect(result.currency).toBe('COP');
    expect(result.reference).toBeDefined();
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining('Payment for transaction 123 processed successfully'),
    );
  });

  it('debería manejar un pago pendiente y luego aprobado', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { data: { presigned_acceptance: { acceptance_token: 'acceptance_token' } } },
    });

    mockedAxios.post.mockResolvedValueOnce({
      data: { data: { status: 'PENDING', id: 'ext123' } },
    });

    // Mock validatePayment para que retorne true inmediatamente
    jest.spyOn(providerPaymentService as any, 'validatePayment').mockResolvedValue(true);

    const result = await providerPaymentService.processPayment('123', 100, {
      email: 'test@example.com',
      token: 'cardToken',
    });

    expect(result.status).toBe('APPROVED');
    expect(result.externalTransactionId).toBeDefined();
    expect(result.internalTransactionId).toBe('123');
  });

  it('debería manejar un pago pendiente que permanece pendiente', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { data: { presigned_acceptance: { acceptance_token: 'acceptance_token' } } },
    });

    mockedAxios.post.mockResolvedValueOnce({
      data: { data: { status: 'PENDING', id: 'ext123' } },
    });

    // Mock validatePayment para que retorne false inmediatamente
    jest.spyOn(providerPaymentService as any, 'validatePayment').mockResolvedValue(false);

    const result = await providerPaymentService.processPayment('123', 100, {
      email: 'test@example.com',
      token: 'cardToken',
    });

    expect(result.status).toBe('PENDING');
    expect(result.externalTransactionId).toBeDefined();
    expect(result.internalTransactionId).toBe('123');
  }, 10000); // Aumentamos el tiempo de espera a 10 segundos

  it('debería manejar un fallo en el pago', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { data: { presigned_acceptance: { acceptance_token: 'acceptance_token' } } },
    });

    mockedAxios.post.mockRejectedValueOnce(new Error('Payment failed'));

    const result = await providerPaymentService.processPayment('123', 100, {
      email: 'test@example.com',
      token: 'cardToken',
    });

    expect(result.status).toBe('FAILED');
    expect(result.internalTransactionId).toBe('123');
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Error processing payment for transaction 123'),
      expect.any(Error),
    );
  });

  it('debería manejar un error al obtener el token de aceptación', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Failed to get acceptance token'));

    const result = await providerPaymentService.processPayment('123', 100, {
      email: 'test@example.com',
      token: 'cardToken',
    });

    expect(result.status).toBe('FAILED');
    expect(result.internalTransactionId).toBe('123');
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Error processing payment for transaction 123'),
      expect.any(Error),
    );
  });
});
