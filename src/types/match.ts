import { Bson } from "../../deps.ts";

export type TMatch = {
    _id: string,
    name: string,
    viewedAt: Date | null,
    createdAt: Date,
    offer: Bson.ObjectId | string,
    user: Bson.ObjectId | string,
    hash?: string
}