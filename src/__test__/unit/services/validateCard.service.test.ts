import { ValidateCardService } from '../../../../src/infrastructure/services/validateCard.service';
import {
  ICreditCard,
  ICardValidateResponse,
} from '../../../../src/application/ports/interfaces/card.interface';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ValidateCardService', () => {
  let validateCardService: ValidateCardService;
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.PROVIDER_API__VALIDATE_CARD_TOKEN = 'test_token';
    process.env.PROVIDER_API_VALIDATE_CARD_URL = 'https://api.test.com';
    validateCardService = new ValidateCardService();
  });

  afterEach(() => {
    jest.clearAllMocks();
    process.env = originalEnv;
  });

  const cardInfo: ICreditCard = {
    number: '1234567890123456',
    expYear: '28',
    expMonth: '08',
    cvc: '123',
    cardHolder: 'John Doe',
  };

  it('should return valid card response when API call is successful', async () => {
    const expectedResponse: ICardValidateResponse = {
      status: 'success',
      data: { id: 'card_123' },
    };

    mockedAxios.post.mockResolvedValue({ status: 201, data: expectedResponse });

    const result = await validateCardService.validate(cardInfo);

    expect(result).toEqual(expectedResponse);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://api.test.com/v1/tokens/cards',
      {
        number: cardInfo.number,
        cvc: cardInfo.cvc,
        exp_month: cardInfo.expMonth,
        exp_year: cardInfo.expYear,
        card_holder: cardInfo.cardHolder,
      },
      {
        headers: {
          Authorization: 'Bearer test_token',
          'Content-Type': 'application/json',
        },
      },
    );
  });

  it('should return null when API returns a non-201 status', async () => {
    mockedAxios.post.mockResolvedValue({ status: 400, data: {} });

    const result = await validateCardService.validate(cardInfo);

    expect(result).toBeNull();
  });

  it('should throw an error when API call fails', async () => {
    mockedAxios.post.mockRejectedValue(new Error('API call failed'));

    await expect(validateCardService.validate(cardInfo)).rejects.toThrow('Failed to validate card');
  });

  it('should use default values when environment variables are not set', async () => {
    delete process.env.PROVIDER_API__VALIDATE_CARD_TOKEN;
    delete process.env.PROVIDER_API_VALIDATE_CARD_URL;

    const newValidateCardService = new ValidateCardService();
    mockedAxios.post.mockResolvedValue({
      status: 201,
      data: { status: 'success', data: { id: 'card_123' } },
    });

    await newValidateCardService.validate(cardInfo);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer ',
        }),
      }),
    );
  });
});
