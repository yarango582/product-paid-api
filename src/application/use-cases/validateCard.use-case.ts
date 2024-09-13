import { Inject, Service } from 'typedi';
import { ValidateCardService } from '../../infrastructure/services/validateCard.service';
import { ICreditCard } from '../ports/interfaces/card.interface';

@Service()
export class ValidateCardUseCase {
  constructor(
    @Inject(() => ValidateCardService) private validateCardService: ValidateCardService,
  ) {}
  async execute(cardInfo: ICreditCard) {
    try {
      const response = await this.validateCardService.validate(cardInfo);
      if (!response) {
        return null;
      }
      return response;
    } catch (error) {
      throw new Error('Failed to validate card');
    }
  }
}
