import { Schema } from "https://deno.land/x/valivar@v6.2.11/mod.ts"
import { Currencies } from '../types/offer.ts';

const offerSchema = new Schema({
    location: [{type: Number, required: true, length: 2}],
    currFrom: {type: String, required: true, enum: Object.values(Currencies) },
    currTo: {type: String, required: true, enum: Object.values(Currencies) },
})

export default offerSchema
