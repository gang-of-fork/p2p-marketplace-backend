import { Schema } from "https://deno.land/x/valivar@v6.2.11/mod.ts"
import { Currencies, CryptoCurrencies, OfferTypes } from '../types/offer.ts';

const offerSchema = new Schema({
    location: [{type: Number, required: true, length: 2}],
    type: {type: String, required: true, enum: Object.values(OfferTypes) },
    currFrom: {type: String, required: true, enum: [...Object.values(Currencies), ...Object.values(CryptoCurrencies)] },
    currTo: {type: String, required: true, enum: [...Object.values(Currencies), ...Object.values(CryptoCurrencies)] },
})

export default offerSchema
