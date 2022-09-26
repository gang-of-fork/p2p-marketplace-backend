export enum Currencies {
    GBP = 'GBP',
    USD = 'USD',
    CAD = 'CAD',
    EUR = 'EUR'
}

export type Offer = {
    _id: string,
    location: [number, number],
    currFrom: Currencies,
    currTo: Currencies
}