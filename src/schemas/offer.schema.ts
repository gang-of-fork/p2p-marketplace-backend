import { Schema } from "../../deps.ts";
import { Currencies, CryptoCurrencies, OfferTypes } from '../types/offer.ts';

const offerSchema = new Schema({
    location: [{type: Number, required: true }],
    type: {type: String, required: true, enum: Object.values(OfferTypes) },
    crypto: {type: String, required: true, enum: Object.values(CryptoCurrencies) },
    currency: {type: String, required: true, enum: Object.values(Currencies) },
})

export default offerSchema
