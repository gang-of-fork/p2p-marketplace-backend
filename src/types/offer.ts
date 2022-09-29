export enum OfferTypes {
    BUY = 'BUY',
    SELL = 'SELL'
}

export enum Currencies {
    GBP = 'GBP',
    USD = 'USD',
    CAD = 'CAD',
    EUR = 'EUR'
}

export enum CryptoCurrencies {
    BTC = 'BTC',
    ETH = 'ETH',
    MON = 'MON',
    CLT = 'CLT'
}

export type Offer = {
    _id: string,
    type: OfferTypes,
    location: [number, number],
    currFrom: Currencies | CryptoCurrencies,
    currTo: Currencies | CryptoCurrencies
}