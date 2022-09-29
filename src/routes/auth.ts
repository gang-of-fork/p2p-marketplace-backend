import { NextFunction, OpineRequest, OpineResponse } from "https://deno.land/x/opine@2.1.1/mod.ts";
import userSchema from "../schemas/user.schema.ts";
import User from "../collections/userCollection.ts"
import { isValidationError } from "../utils/utils.ts";
import { recoverPersonalSignature } from "npm:eth-sig-util"
import { bufferToHex } from "npm:ethereumjs-util"
import { Buffer } from "https://deno.land/std@0.120.0/node/_buffer.js";
import { create } from "https://deno.land/x/djwt@v2.2/mod.ts";
import IV from "../collections/ivCollection.ts"
import Nonce from "../collections/nonceCollection.ts";
import { Aes } from "https://deno.land/x/crypto@v0.10.0/aes.ts";
import {
    Cbc,
    Padding,
} from "https://deno.land/x/crypto@v0.10.0/block-modes.ts";
import {
    decodeString,
    encodeToString,
} from "https://deno.land/std@0.95.0/encoding/hex.ts";
import { TNonce } from "../types/nonce.ts";
import { TUserLookup } from "../types/user.ts";
import Key from "../collections/keysCollection.ts";




export default class AuthController {
    /**
     * POST /auth/register
     */
    static async registerUser(req: OpineRequest, res: OpineResponse, next: NextFunction) {
        const { publicAddress } = req.body;

        //nonceId will be updated in AuthController.updateNonce()
        const userToInsert = {
            publicAddress: publicAddress,
            nonceId: "initial"
        }
        //insert a user and generate a nonce
        try {
            userSchema.assert(userToInsert)
            await User.insertOne(userToInsert)
            await AuthController.updateNonce(publicAddress)
            return res.setStatus(201).send();

        } catch (e) {
            if (isValidationError(e)) {
                return next({ statusCode: 400, msg: e.toString() });
            }
            if(e.toString().startsWith("E11000")) {
                return next({statusCode: 400, msg: "User already exists"})
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
            if (signature.length != 132 || !signature.startsWith("0x")) {
                return next({ statusCode: 400, msg: "Invalid signature length or signature does not start with 0x" })
            }

            const user = await User.findOne({ publicAddress: publicAddress })
            if (!user) {
                return next({ statusCode: 400, msg: "User not Found" })
            }

            //construct verification message
            const nonce = await AuthController.getNonce(publicAddress);
            const msg = `I am signing my one-time nonce: ${nonce}`
            console.log("msg to verify: ", msg)
            const msgBufferHex = bufferToHex(Buffer.from(msg, 'utf8'))

            //verify that the origin of the signature is the publicAddress from the request
            const address = recoverPersonalSignature({ data: msgBufferHex, sig: signature })
            console.log("recovered: ", address)
            console.log("expected: ", publicAddress)
            if (address.toLowerCase() != publicAddress.toLowerCase()) {
                return next({ statusCode: 401, msg: "Signature Verification failed" })
            }

            //create JWT
            const jwt = await create({ alg: "HS512", typ: "JWT" }, {
                userId: user._id,
                publicAddress: user.publicAddress
            }, Deno.env.get("JWT_SECRET") as string);

            return res.json({ jwt: jwt })

        } catch (e) {
            return next({ statusCode: 500, msg: e.toString() });
        }

        finally {
            try {
                //update nonce after every login attempt
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

        //if the nonce still exists, decrypt and return it, if not generate a new Nonce with updateNonce()
        let nonce: string;
        if (user.nonces.length != 0) {
            const encryptedNonce = user.nonces[0].value

            const iv = await IV.findOne({ _id: user.nonces[0].ivId })
            if (!iv) throw "IV not found";

            const key = await Key.findOne({})
            if (!key) throw "AES Secret missing";

            nonce = AuthController.decrypt(encryptedNonce, iv.value, key.value)
        } else {
            nonce = await AuthController.updateNonce(publicAddress)
        }
        return nonce
    }

    /**
     * generate a new nonce and update the reference in the User
     */
    static async updateNonce(publicAddress: string) {
        //generate nonce 
        const value = Math.floor(Math.random() * 99999999) + "";

        //generate IV and save to database
        let iv = new Uint8Array(16);
        iv = crypto.getRandomValues(iv)
        const ivString = encodeToString(iv)
        const ivId = await IV.insertOne({ value: ivString, created_at: new Date() })

        //get encrpytion key
        const key = await Key.findOne({})
        if (!key) throw "AES Secret missing"

        //encrypt nonce
        const encrypted = AuthController.encrypt(value, ivString, key.value)

        //insert Nonce
        const nonceId = <string>await Nonce.insertOne(<TNonce>{ value: encrypted, ivId: ivId, created_at: new Date() })

        //update User with nonce id
        await User.updateOne({ publicAddress: publicAddress }, { $set: { nonceId: nonceId } })

        return value
    }

    /**
     * 
     * @param plainData plainData to encode as string
     * @param ivString InitialVector as hexstring
     * @param keyString AES encryption key as hexstring
     * @returns encrypted Data as string
     */
    static encrypt(plainData: string, ivString: string, keyString: string) {
        const te = new TextEncoder();
        const iv = decodeString(ivString);
        const key = te.encode(keyString);
        const data = te.encode(plainData);
        const cipher = new Cbc(Aes, key, iv, Padding.PKCS7);
        const bytecipher = cipher.encrypt(data);
        return encodeToString(bytecipher);
    }

    /**
     * 
     * @param encryptedData encryptedData to decode as string
     * @param ivString InitialVector as hexstring
     * @param keyString AES encryption key as hexstring
     * @returns plain data as string
     */
    static decrypt(encryptedData: string, ivString: string, keyString: string) {
        const te = new TextEncoder();
        const td = new TextDecoder();
        const iv = decodeString(ivString);
        const key = te.encode(keyString);
        const decipher = new Cbc(Aes, key, iv, Padding.PKCS7);
        const decrypted = decipher.decrypt(decodeString(encryptedData));
        return td.decode(decrypted);
    }
}