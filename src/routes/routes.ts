import { OpineRequest, OpineResponse, Router } from "https://deno.land/x/opine@2.1.1/mod.ts";
import AuthController from "./auth.ts";

const router = Router();

router.get("/ping", (_req: OpineRequest, res: OpineResponse) => {
    res.json({msg: "pong"})
})



router.post("/auth/register", AuthController.registerUser)
router.get("/auth/login/:publicAddress", AuthController.getUserForLogin)
router.post("/auth/login", AuthController.postLogin)
export default router;
