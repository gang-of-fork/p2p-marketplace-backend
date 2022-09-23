import { NextFunction, OpineRequest, OpineResponse } from "https://deno.land/x/opine@2.1.1/mod.ts";
import { dango } from "../../deps.ts";
import User from "../models/user.model.ts";



export default class AuthController {
    static async registerUser(req: OpineRequest, res: OpineResponse, next: NextFunction) {
        //public address must be set
        console.log(req.body)
        const {publicAddress} = req.body;
        if (!publicAddress) {
            //implement error middleware
            return next({statusCode: 400, msg: "please set required fields"});
        }
        //generate initial nonce
        const nonce = Math.floor(Math.random() * 10000)
        const userToInsert = {
            publicAddress: publicAddress,
            nonce: nonce
        }
        try{
            const db_uri = Deno.env.get("DB_URL") as string;
        await dango.connect(db_uri)
        const user = await User.insertMany([userToInsert])   
        return res.json(user)
        
        }catch (e) {
            return next({statusCode: 500, msg: e});
        }
    }
}