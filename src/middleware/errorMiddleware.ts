import { NextFunction, OpineRequest, OpineResponse } from "../../deps.ts";
import { PlantExchangeError } from "../types/errors.ts";

export default function (err: PlantExchangeError, req: OpineRequest, res: OpineResponse, next: NextFunction) {
    console.error(`Error ${err.statusCode}: ${err.msg}\nURL: ${req.originalUrl}\nBody: ${JSON.stringify(req.body, null, 4)}\nHeaders: ${JSON.stringify(req.headers, null, 4)}\n----------`)
    if (err) {
        res.setStatus(err.statusCode).json({statusCode: err.statusCode, msg: err.msg || "Something went wrong"})
    }
    next();
}