import { Service } from 'typedi';
import {
  ICardValidateResponse,
  ICreditCard,
} from '../../application/ports/interfaces/card.interface';
import axios from 'axios';

@Service()
export class ValidateCardService {
  private readonly providerBaseUrl: string;
  private readonly providerApiKey: string;

  constructor() {
    this.providerApiKey = process.env.PROVIDER_API__VALIDATE_CARD_TOKEN || '';
    this.providerBaseUrl = process.env.PROVIDER_API_VALIDATE_CARD_URL || '';
  }

  async validate(cardInfo: ICreditCard): Promise<ICardValidateResponse | null> {
    const body = {
      number: cardInfo.number,
      cvc: cardInfo.cvc,
      exp_month: cardInfo.expYear,
      exp_year: cardInfo.expYear,
      card_holder: cardInfo.cardHolder,
    };
    try {
      const response = await axios.post(`${this.providerBaseUrl}/v1/tokens/cards`, body, {
        headers: {
          Authorization: `Bearer ${this.providerApiKey}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 201) {
        return response.data as ICardValidateResponse;
      }
      return null;
    } catch (error) {
      throw new Error('Failed to validate card');
    }
  }
}
