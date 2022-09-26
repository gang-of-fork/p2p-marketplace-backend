import {
    NextFunction,
    OpineRequest,
    OpineResponse,
  } from "https://deno.land/x/opine@2.1.1/mod.ts";
  
import offerSchema from "../schemas/offer.schema.ts";

export default class OfferController {
    public static async createOffer(req: OpineRequest, res: OpineResponse, next: NextFunction) {
        const offer = {
            location: req.body.location,
            currFrom: req.body.currFrom,
            currTo: req.body.currTo
        }
    }
}