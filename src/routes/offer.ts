import { OpineRequest, OpineResponse, NextFunction, Bson } from "../depts.ts";

import Offer from "../collections/offerCollection.ts";
import offerSchema from "../schemas/offer.schema.ts";
import User from "../collections/userCollection.ts"

import { isValidationError } from "../utils/utils.ts";
import { TRequestWithUser } from "../types/request.ts";

export default class OfferController {
    public static async getAllOffers(req: OpineRequest, res: OpineResponse, next: NextFunction) {
        const data = await Offer.find().toArray();
        const count = await Offer.countDocuments();

        res.json({
            data: data,
            count: count
        });
    }   

    public static async getOfferById(req: OpineRequest, res: OpineResponse, next: NextFunction) {
        if(!Bson.ObjectId.isValid(req.params.id)) {
            return next({ statusCode: 400, msg: 'id is not a valid ObjectId' });
        }
        
        const query = { _id: new Bson.ObjectId(req.params.id) };

        const data = await Offer.findOne(query);

        if(!data) {
            return next({ statusCode: 400, msg: `No offer with id ${req.params.id}` });
        }

        res.json(data);
    }

    public static async deleteOffer(req: OpineRequest, res: OpineResponse, next: NextFunction) {
        if(!Bson.ObjectId.isValid(req.params.id)) {
            return next({ statusCode: 400, msg: 'id is not a valid ObjectId' });
        }

        const query = { _id: new Bson.ObjectId(req.params.id) };
        
        const data = await Offer.deleteOne(query);

        if(!data) {
            return next({ statusCode: 400, msg: `No offer with id ${req.params.id}` });
        }

        res.setStatus(201).json();
    }

    public static async createOffer(req: OpineRequest, res: OpineResponse, next: NextFunction) {
        if(!Array.isArray(req.body.location) || req.body.location.length != 2) {
            return next({ statusCode: 400, msg: 'location must be valid lat, long array' });
        }
        
        const offerToInsert = {
            type: req.body.type,
            location: req.body.location,
            crypto: req.body.crypto,
            currency: req.body.currency
        }

        try {
            offerSchema.assert(offerToInsert);
            const offer = await Offer.insertOne(offerToInsert);
            
            User.updateOne({ _id: new Bson.ObjectId(<TRequestWithUser>req).user.userId })

            return res.setStatus(201).send();
        } catch (e) {
            if(isValidationError(e)) {
                return next({ statusCode: 400, msg: e.toString() });
            }
            //remove message in prod for security reasons
            return next({ statusCode: 500, msg: e.toString() });
        }
    }
}