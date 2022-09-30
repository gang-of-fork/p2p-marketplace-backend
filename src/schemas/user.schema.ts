import { Schema } from "https://deno.land/x/valivar@v6.2.11/mod.ts"
import { Bson } from "../depts.ts";

const userSchema = new Schema({
    publicAddress: {type: String, required: true},
    offers: [ { type: Bson.ObjectId } ]
})

export default userSchema

