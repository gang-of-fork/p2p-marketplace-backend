import { NextFunction, OpineRequest, OpineResponse } from "https://deno.land/x/opine@2.1.1/mod.ts";
import userSchema from "../schemas/user.schema.ts";
import User from "../collections/userCollection.ts"
import { isValidationError } from "../utils/utils.ts";
import { recoverPersonalSignature} from "npm:eth-sig-util"
import {bufferToHex} from "npm:ethereumjs-util"
import { Buffer } from "https://deno.land/std@0.120.0/node/_buffer.js";
import {create} from "https://deno.land/x/djwt@v2.2/mod.ts";



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
        const {publicAddress, signature}:{publicAddress: string, signature: string} = req.body;    
        try{
            if(signature.length != 132 && !signature.startsWith("0x")) {
                return next({statusCode: 400, msg: "Invalid signature length or signature does not start with 0x"})
            }
            
            const user = await User.findOne({publicAddress: publicAddress});
            if (!user) {return next({ statusCode: 400 , msg: "User not found"})}

            const msg = `I am signing my one-time nonce: ${user.nonce}`
            const msgBufferHex = bufferToHex(Buffer.from(msg, 'utf8'))

            const address = recoverPersonalSignature({data: msgBufferHex, sig: signature})
            if(address.toLowerCase() != publicAddress.toLowerCase()) {
                return next({statusCode: 401, msg: "Signature Verification failed"})
            }
            
            const jwt = await create({ alg: "HS512", typ: "JWT" }, {
                userId: user._id,
                publicAddress: user.publicAddress
              }, Deno.env.get("JWT_SECRET") as string);

            return res.json({jwt: jwt})

        } catch(e) {
            return next({ statusCode: 500, msg: e.toString() });
        }
        finally {
            try{
                User.updateOne({publicAddress: publicAddress}, {$set:{nonce: Math.floor(Math.random() * 10000)}})
            } catch(_e) {//do nothing
            }
        }
    }
}