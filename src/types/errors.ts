import { OpineRequest, OpineResponse } from "https://deno.land/x/opine@2.1.1/mod.ts"

export type PlantExchangeError = {
    statusCode: number, 
    msg: string
}

export type NextErrorHandler = (err: PlantExchangeError, req: OpineRequest, res: OpineResponse) => void