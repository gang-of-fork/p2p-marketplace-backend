import { Schema } from "../../deps.ts";
import { Currencies, CryptoCurrencies, OfferTypes } from '../types/offer.ts';

const offerSchema = new Schema({
    location: [{type: Number, required: true }],
    name: {type: String, required: true},
    type: {type: String, required: true, enum: Object.values(OfferTypes) },
    crypto: {type: String, required: true, enum: Object.values(CryptoCurrencies) },
    currency: {type: String, required: true, enum: Object.values(Currencies) },
    currencyAmount: {type: Number, required: true},
    cryptoAmount: {type: Number, required: true},
})

export default offerSchema
