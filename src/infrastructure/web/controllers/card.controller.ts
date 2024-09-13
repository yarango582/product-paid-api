import {
  JsonController,
  BadRequestError,
  NotFoundError,
  HttpCode,
  Post,
  Body,
} from 'routing-controllers';
import { Inject, Service } from 'typedi';
import { ValidateCardUseCase } from '../../../application/use-cases/validateCard.use-case';
import { ICreditCard } from '../../../application/ports/interfaces/card.interface';

@JsonController('/card')
@Service()
export class CardController {
  constructor(
    @Inject(() => ValidateCardUseCase) private validateCardUseCase: ValidateCardUseCase,
  ) {}

  @Post('/validate')
  @HttpCode(200)
  async getProduct(@Body() cardInfo: ICreditCard) {
    try {
      const result = await this.validateCardUseCase.execute(cardInfo);
      if (!result) {
        throw new NotFoundError('Card not found');
      }
      return result;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new BadRequestError('Failed to validate card');
    }
  }
}
