import { Schema, Bson } from "../../deps.ts";

const matchSchema = new Schema({
    viewedAt: {type: Date, default: null },
    name: {type: String, required: true},
    createdAt: { type: Date, required: true },
    user: { type: Bson.ObjectId, required: true },
    offer: { type: Bson.ObjectId, required: true },
    hash: { type: String, default: "" }
});

export default matchSchema