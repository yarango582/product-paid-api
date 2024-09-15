export interface ICreditCard {
  number: string;
  cvc: string;
  expMonth: string;
  expYear: string;
  cardHolder: string;
}

export interface ICardValidateResponse {
  status: string;
  data: {
    id: string;
  };
}
