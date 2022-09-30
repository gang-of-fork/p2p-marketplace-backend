import { Schema } from "../depts.ts";
import { Bson } from "../depts.ts";

const userSchema = new Schema({
    publicAddress: {type: String, required: true},
    offers: [ { type: Bson.ObjectId } ]
})

export default userSchema

