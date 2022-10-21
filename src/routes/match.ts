import { OpineRequest, OpineResponse, NextFunction } from '../../deps.ts';
import { Bson } from '../../deps.ts';

import matchSchema from "../schemas/match.schema.ts";

import Match from "../collections/matchCollection.ts";
import Offer from "../collections/offerCollection.ts";
import User from "../collections/userCollection.ts";

import { getRandomPlantName, isValidationError } from "../utils/utils.ts";
import { TRequestWithUser } from "../types/request.ts";
import { TOffer } from '../types/offer.ts';

export default class MatchController {
    public static async matchOffer(req: OpineRequest, res: OpineResponse, next: NextFunction) {
        const offer = await Offer.findOne({ _id: new Bson.ObjectId(req.params.offerId) });

        if(!offer) {
            return next({ statusCode: 400, msg: `No offer to match with id ${req.params.offerId}` })
        }

        const matchToCreate = {
            viewedAt: null,
            createdAt: new Date(),
            user: new Bson.ObjectId((<TRequestWithUser> req).user.userId as string),
            offer: new Bson.ObjectId(req.params.offerId),
            name: `${(<TOffer>offer).name} - ${getRandomPlantName()}`
        }


        try {
            matchSchema.assert(matchToCreate);
            const matchId = await Match.insertOne(matchToCreate);
            const user = await User.findOne({ offers: new Bson.ObjectId(req.params.offerId) });

            return res.setStatus(200).json({ publicKey: user?.publicKey, match: matchId });
          } catch (e) {
            if (isValidationError(e)) {
              return next({ statusCode: 400, msg: e.toString() });
            }
            //remove message in prod for security reasons
            return next({ statusCode: 500, msg: e.toString() });
          }
    }

    public static async submitHashForMatch(req: OpineRequest, res: OpineResponse, next: NextFunction) {
        if(!req.body.hash) {
            return next({ statusCode: 400, msg: "Please provide hash in body" });
        }

        const query = { 
            $or: [ { hash: "" }, { hash: { $exists: false } } ],
            user: new Bson.ObjectId((<TRequestWithUser> req).user.userId as string),
            _id: new Bson.ObjectId(req.params.matchId)

        }

        const matchId = await Match.updateOne(query, { "$set": { hash: req.body.hash } });

        if(!matchId) {
            return next({ statusCode: 400, msg: "No match found" });
        }

        res.setStatus(201).send();
    }

    public static async getMyMatches(req: OpineRequest, res: OpineResponse, next: NextFunction) {
        const myUser = await User.findOne({ _id: new Bson.ObjectId((<TRequestWithUser> req).user.userId as string) });

        if(!myUser) {
            return next({ statusCode: 500, msg: "Somthing went wrong" });
        }

        const matches = await Match.find({ offer: { $in: myUser.offers }, $and: [ { hash: { $ne: "" } }, { hash: { $exists: true } } ], }, { projection: { _id: 1, name: 1 } }).toArray();

        res.json({
            data: matches,
            count: matches.length
        });
    }

    public static async viewMatch(req: OpineRequest, res: OpineResponse, next: NextFunction) {
        const myUser = await User.findOne({ _id: new Bson.ObjectId((<TRequestWithUser> req).user.userId as string) });

        if(!myUser) {
            return next({ statusCode: 500, msg: "Somthing went wrong" });
        }
        
        const viewedAt = new Date();

        const match = await Match.findOne({ _id: new Bson.ObjectId(req.params.matchId), offer: { $in: myUser.offers }, $and: [ { hash: { $ne: "" } }, { hash: { $exists: true } } ] }, { projection: { user: 0 } });

        if(!match) {
            return next({ statusCode: 400, msg: "No match found" });
        }

        if(!match?.viewedAt) {
            await Match.updateOne(
                { _id: match._id },
                { $set: { viewedAt: viewedAt } }
            );
        }

        res.json(match);
    }
}