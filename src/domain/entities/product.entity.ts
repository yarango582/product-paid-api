export class Product {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public price: number,
    public stockQuantity: number,
    public publicImageURL?: string,
  ) {}
}
