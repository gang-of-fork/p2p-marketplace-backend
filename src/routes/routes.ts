import { OpineRequest, OpineResponse, Router } from "https://deno.land/x/opine@2.1.1/mod.ts";
import AuthController from "./auth.ts";
import OfferController from "./offer.ts";

import authMiddleware from "../middleware/authMiddleware.ts";

const router = Router();

router.get("/ping", (_req: OpineRequest, res: OpineResponse) => {
    res.json({msg: "pong"})
});

/**
 * Auth Controller Routes
 */
router.post("/auth/register", AuthController.registerUser)
router.get("/auth/login/:publicAddress", AuthController.getUserForLogin)
router.post("/auth/login", AuthController.postLogin)

/**
 * Offer Controller Routes
 */
router.get("/offers", authMiddleware, OfferController.getAllOffers);
router.post("/offers", authMiddleware, OfferController.createOffer);
router.get("/offers/:id", OfferController.getOfferById);
router.delete("/offers/:id", OfferController.deleteOffer);

export default router;
