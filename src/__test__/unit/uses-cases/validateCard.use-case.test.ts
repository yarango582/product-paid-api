import 'reflect-metadata';
import { ValidateCardUseCase } from '../../../../src/application/use-cases/validateCard.use-case';
import { ValidateCardService } from '../../../../src/infrastructure/services/validateCard.service';
import {
  ICreditCard,
  ICardValidateResponse,
} from '../../../../src/application/ports/interfaces/card.interface';
import { Container } from 'typedi';

describe('ValidateCardUseCase', () => {
  let validateCardUseCase: ValidateCardUseCase;
  let validateCardService: jest.Mocked<ValidateCardService>;

  beforeEach(() => {
    validateCardService = {
      validate: jest.fn(),
    } as unknown as jest.Mocked<ValidateCardService>;

    Container.set(ValidateCardService, validateCardService);
    validateCardUseCase = new ValidateCardUseCase(validateCardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const cardInfo: ICreditCard = {
    number: '1234567890123456',
    expYear: '28',
    expMonth: '08',
    cvc: '123',
    cardHolder: 'John Doe',
  };

  it('should return valid card response when card is valid', async () => {
    const expectedResponse: ICardValidateResponse = {
      status: 'success',
      data: { id: 'card_123' },
    };

    validateCardService.validate.mockResolvedValue(expectedResponse);

    const result = await validateCardUseCase.execute(cardInfo);

    expect(result).toEqual(expectedResponse);
    expect(validateCardService.validate).toHaveBeenCalledWith(cardInfo);
  });

  it('should return null when card is not found', async () => {
    validateCardService.validate.mockResolvedValue(null);

    const result = await validateCardUseCase.execute(cardInfo);

    expect(result).toBeNull();
    expect(validateCardService.validate).toHaveBeenCalledWith(cardInfo);
  });

  it('should throw an error when validation fails', async () => {
    const errorMessage = 'Failed to validate card';
    validateCardService.validate.mockRejectedValue(new Error(errorMessage));

    await expect(validateCardUseCase.execute(cardInfo)).rejects.toThrow(errorMessage);
    expect(validateCardService.validate).toHaveBeenCalledWith(cardInfo);
  });

  it('should pass the correct card info to the service', async () => {
    validateCardService.validate.mockResolvedValue({
      status: 'success',
      data: { id: 'card_123' },
    });

    await validateCardUseCase.execute(cardInfo);

    expect(validateCardService.validate).toHaveBeenCalledWith(cardInfo);
  });
});
