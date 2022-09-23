import { NextFunction, OpineRequest, OpineResponse } from "https://deno.land/x/opine@2.1.1/mod.ts";
import userSchema from "../schemas/user.schema.ts";
import User from "../collections/userCollection.ts"



export default class AuthController {
    static async registerUser(req: OpineRequest, res: OpineResponse, next: NextFunction) {
        //public address must be set
        const { publicAddress } = req.body;

        //generate initial nonce
        const nonce = Math.floor(Math.random() * 10000)
        const userToInsert = {
            publicAddress: publicAddress,
            nonce: nonce
        }
        try {
            userSchema.assert(userToInsert)
            await User.insertOne(userToInsert)
            return res.setStatus(201).send();

        } catch (e) {
            return next({ statusCode: 500, msg: e.toString() });
        }
    }
}