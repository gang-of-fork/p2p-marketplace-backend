import { Schema } from "https://deno.land/x/valivar@v6.2.11/mod.ts"
import { Currencies, CryptoCurrencies, OfferTypes } from '../types/offer.ts';

const offerSchema = new Schema({
    location: [{type: Number, required: true }],
    type: {type: String, required: true, enum: Object.values(OfferTypes) },
    crypto: {type: String, required: true, enum: Object.values(CryptoCurrencies) },
    currency: {type: String, required: true, enum: Object.values(Currencies) },
})

export default offerSchema
