import { Schema } from "https://deno.land/x/valivar@v6.2.11/mod.ts"

const userSchema = new Schema({
    publicAddress: {type: String, required: true},
    nonce: {type: Number, required: true}
})

export default userSchema

