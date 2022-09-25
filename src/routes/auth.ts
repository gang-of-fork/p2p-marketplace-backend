import { NextFunction, OpineRequest, OpineResponse } from "https://deno.land/x/opine@2.1.1/mod.ts";
import userSchema from "../schemas/user.schema.ts";
import User from "../collections/userCollection.ts"
import { isValidationError } from "../utils/utils.ts";



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
            if(isValidationError(e)) {
                return next({ statusCode: 400, msg: e.toString() });
            }
            //remove message in prod for security reasons
            return next({ statusCode: 500, msg: e.toString() });
        }
    }

    static async getUserForLogin(req: OpineRequest, res: OpineResponse, next: NextFunction) {
        try {
            const user = await User.findOne({ publicAddress: req.params.publicAddress }, {
                projection: {
                    publicAddress: 1,
                    nonce: 1,
                    _id: 0
                }
            });

            //remove message in prod for security reasons
            if (!user) {return next({ statusCode: 400 , msg: "User not found"})}

            return res.json(user)
        }
        catch (e) {
            return next({ statusCode: 500, msg: e.toString() });
        }
    }

    static async postLogin(req: OpineRequest, res: OpineResponse, next: NextFunction) {
        //TODO
    }
}