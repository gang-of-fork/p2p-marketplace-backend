import { OpineRequest } from "https://deno.land/x/opine@2.1.1/mod.ts";
import { TUserJWT } from "./user.ts";

export type TRequestWithUser = OpineRequest & {
    user: TUserJWT 
}