import { NextFunction, OpineRequest, OpineResponse } from "https://deno.land/x/opine@2.1.1/mod.ts";
import { PlantExchangeError } from "../types/errors.ts";

//last middleware so no next needed
export default function (err: PlantExchangeError, _req: OpineRequest, res: OpineResponse, next: NextFunction) {
    console.error(err.msg)
    if (err) {
        res.setStatus(err.statusCode).json({statusCode: err.statusCode, msg: err.msg})
    }
    next();
}