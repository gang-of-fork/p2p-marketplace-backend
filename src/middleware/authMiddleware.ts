import { NextFunction, OpineRequest, OpineResponse } from "https://deno.land/x/opine@2.1.1/mod.ts";
import { verify } from "https://deno.land/x/djwt@v2.2/mod.ts";

export default async function authMiddleware(
  req: OpineRequest,
  _res: OpineResponse,
  next: NextFunction,
) {
  try {
    const bearer = req.headers.get("Authorization") as string;
    if (!bearer.startsWith("Bearer ")) {
      return next({ statusCode: 400, msg: "Wrong Bearer format" });
    }
    const jwt = bearer.substring("Bearer ".length);

    await verify(jwt, Deno.env.get("JWT_SECRET") as string, "HS512");
    next();
  } catch (_e) {
    return next({ statusCode: 401, msg: "Unauthorized" })
  }
}
