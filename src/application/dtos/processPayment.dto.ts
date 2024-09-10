import { IsString, IsNumber, IsPositive, ValidateNested, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

class PaymentDetailsDto {
  @IsString()
  cardNumber: string;

  @IsString()
  cardHolder: string;

  @IsString()
  expirationDate: string;

  @IsString()
  cvv: string;
}

export class ProcessPaymentDto {
  @IsString()
  productId: string;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsString()
  cardToken: string;

  @IsEmail()
  email: string;

  @ValidateNested()
  @Type(() => PaymentDetailsDto)
  paymentDetails: PaymentDetailsDto;
}
