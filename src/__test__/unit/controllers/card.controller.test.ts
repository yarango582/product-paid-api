import 'reflect-metadata';
import { CardController } from '../../../../src/infrastructure/web/controllers/card.controller';
import { ValidateCardUseCase } from '../../../../src/application/use-cases/validateCard.use-case';
import {
  ICreditCard,
  ICardValidateResponse,
} from '../../../../src/application/ports/interfaces/card.interface';
import { BadRequestError, NotFoundError } from 'routing-controllers';
import { Container } from 'typedi';

describe('CardController', () => {
  let cardController: CardController;
  let validateCardUseCase: ValidateCardUseCase;

  beforeEach(() => {
    validateCardUseCase = {
      execute: jest.fn(),
    } as unknown as ValidateCardUseCase;

    Container.set(ValidateCardUseCase, validateCardUseCase);
    cardController = new CardController(validateCardUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateCard', () => {
    const cardInfo: ICreditCard = {
      number: '1234567890123456',
      expYear: '28',
      expMonth: '08',
      cvc: '123',
      cardHolder: 'John Doe',
    };

    it('should return result when card is valid', async () => {
      const expectedResult: ICardValidateResponse = {
        status: 'success',
        data: { id: 'card_123' },
      };

      (validateCardUseCase.execute as jest.Mock).mockResolvedValue(expectedResult);

      const result = await cardController.getProduct(cardInfo);

      expect(result).toEqual(expectedResult);
      expect(validateCardUseCase.execute).toHaveBeenCalledWith(cardInfo);
    });

    it('should throw NotFoundError when card is not found', async () => {
      (validateCardUseCase.execute as jest.Mock).mockResolvedValue(null);

      await expect(cardController.getProduct(cardInfo)).rejects.toThrow(NotFoundError);
      await expect(cardController.getProduct(cardInfo)).rejects.toThrow('Card not found');
      expect(validateCardUseCase.execute).toHaveBeenCalledWith(cardInfo);
    });

    it('should throw BadRequestError when validation fails', async () => {
      (validateCardUseCase.execute as jest.Mock).mockRejectedValue(new Error('Validation failed'));

      await expect(cardController.getProduct(cardInfo)).rejects.toThrow(BadRequestError);
      await expect(cardController.getProduct(cardInfo)).rejects.toThrow('Failed to validate card');
      expect(validateCardUseCase.execute).toHaveBeenCalledWith(cardInfo);
    });

    it('should pass the correct card info to the use case', async () => {
      (validateCardUseCase.execute as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { id: 'card_123' },
      });

      await cardController.getProduct(cardInfo);

      expect(validateCardUseCase.execute).toHaveBeenCalledWith(cardInfo);
    });
  });
});
