import { NextFunction, OpineRequest, OpineResponse, Buffer, create } from "../../deps.ts";
import userSchema from "../schemas/user.schema.ts";
import User from "../collections/userCollection.ts"
import { isValidationError } from "../utils/utils.ts";
import { recoverPersonalSignature } from "npm:eth-sig-util"
import { bufferToHex } from "npm:ethereumjs-util"
import Nonce from "../collections/nonceCollection.ts";
import { TNonce } from "../types/nonce.ts";
import { TUserJWT, TUserLookup } from "../types/user.ts";

export default class AuthController {
    /**
     * POST /auth/register
     */
    static async registerUser(req: OpineRequest, res: OpineResponse, next: NextFunction) {
        const { publicAddress, publicKey } = req.body;

        //nonceId will be updated in AuthController.updateNonce()
        const userToInsert = {
            publicAddress: publicAddress,
            nonceId: "initial",
            publicKey: publicKey
        }
        //insert a user and generate a nonce
        try {
            userSchema.assert(userToInsert)
            await User.insertOne(userToInsert)
            return res.setStatus(201).send();

        } catch (e) {
            if (isValidationError(e)) {
                return next({ statusCode: 400, msg: e.toString() });
            }
            if (e.toString().startsWith("Error: E11000")) {
                return next({ statusCode: 400, msg: "User already exists" })
            }
            //remove message in prod for security reasons
            return next({ statusCode: 500, msg: e.toString() });
        }
    }

    /**
     * GET /auth/login/:publicAddress
     */
    static async getUserForLogin(req: OpineRequest, res: OpineResponse, next: NextFunction) {
        try {
            const nonce = await AuthController.getNonce(req.params.publicAddress);
            return res.json({
                publicAddress: req.params.publicAddress,
                nonce: nonce
            })
        }
        catch (e) {
            return next({ statusCode: 500, msg: e.toString() });
        }
    }
    /**
     * POST /auth/login
     */
    static async postLogin(req: OpineRequest, res: OpineResponse, next: NextFunction) {
        const { publicAddress, signature }: { publicAddress: string, signature: string } = req.body;
        try {
            //check signature format
            if (!signature || signature.length != 132 || !signature.startsWith("0x")) {
                return next({ statusCode: 400, msg: "Invalid signature length or signature does not start with 0x" })
            }

            const user = await User.findOne({ publicAddress: publicAddress })
            if (!user) {
                return next({ statusCode: 400, msg: "User not Found" })
            }

            //construct verification message
            const nonce = await AuthController.getNonce(publicAddress);
            const msg = `I am signing my one-time nonce: ${nonce}`
            const msgBufferHex = bufferToHex(Buffer.from(msg, 'utf8'))

            //verify that the origin of the signature is the publicAddress from the request
            const address = recoverPersonalSignature({ data: msgBufferHex, sig: signature })
            if (address.toLowerCase() != publicAddress.toLowerCase()) {
                return next({ statusCode: 401, msg: "Signature Verification failed" })
            }

            //create JWT
            const jwt = await create({ alg: "HS512", typ: "JWT" }, <TUserJWT>{
                userId: user._id,
                publicAddress: user.publicAddress
            }, Deno.env.get("JWT_SECRET") as string);

            return res.json({ jwt: jwt })

        } catch (e) {
            return next({ statusCode: 500, msg: e.toString() });
        }

        finally {
            try {
                //update Nonce after every login attempt
                //(optional) change this to delete instead
                AuthController.updateNonce(publicAddress)
            } catch (_e) {//
            }
        }
    }

    /**
     * retrieve a nonce for a User or update and retrieve it, if it was deleted by TTL index
     */
    static async getNonce(publicAddress: string) {
        //Query user with joined nonce
        const users = await User.aggregate<TUserLookup>([{ $match: { publicAddress: publicAddress } }, { $lookup: { from: 'nonces', localField: 'nonceId', foreignField: '_id', as: 'nonces' } }]).toArray();
        if (!users[0]) throw "User not found"
        const user = users[0];

        //if the nonce still exists, return it, if not generate a new Nonce with updateNonce()
        if (user.nonces.length != 0) {
            return user.nonces[0].value
        }
        return await AuthController.updateNonce(publicAddress)

    }

    /**
     * generate a new nonce and update the reference in the User
     */
    static async updateNonce(publicAddress: string) {
        //generate nonce 
        const value = globalThis.crypto.randomUUID();

        //insert Nonce
        const nonceId = <string>await Nonce.insertOne(<TNonce>{ value: value, created_at: new Date() })

        //update User with nonce id
        await User.updateOne({ publicAddress: publicAddress }, { $set: { nonceId: nonceId } })

        return value
    }
}