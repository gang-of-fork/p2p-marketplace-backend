import { NextFunction, OpineRequest, OpineResponse } from "../../deps.ts";
import { PlantExchangeError } from "../types/errors.ts";

export default function (err: PlantExchangeError, req: OpineRequest, res: OpineResponse, next: NextFunction) {
    console.error(`${new Date()}\nError ${err.statusCode}: ${err.msg}\nURL: ${req.originalUrl}\nBody: ${JSON.stringify(req.body, null, 4)}\nHeaders: ${JSON.stringify({Authorization: req.headers.get("Authorization"), content_type: req.headers.get("Content-Type")}, null, 4)}\n----------`)
    if (err) {
        res.setStatus(err.statusCode).json({statusCode: err.statusCode, msg: err.msg || "Something went wrong"})
    }
    next();
}