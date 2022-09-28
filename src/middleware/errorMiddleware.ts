import { NextFunction, OpineRequest, OpineResponse } from "https://deno.land/x/opine@2.1.1/mod.ts";
import { PlantExchangeError } from "../types/errors.ts";

export default function (err: PlantExchangeError, _req: OpineRequest, res: OpineResponse, next: NextFunction) {
    console.error("Error " + err.statusCode + ": " + err.msg)
    if (err) {
        res.setStatus(err.statusCode).json({statusCode: err.statusCode, msg: err.msg || "Something went wrong"})
    }
    next();
}