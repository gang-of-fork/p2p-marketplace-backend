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

export type TOffer = {
    _id: string,
    name: string,
    type: OfferTypes,
    location: [number, number],
    crypto: CryptoCurrencies,
    currency: Currencies
}