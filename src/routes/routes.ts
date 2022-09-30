import { OpineRequest, OpineResponse, Router } from "../depts.ts";
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
router.get("/offers/my", authMiddleware, OfferController.getMyOffers);
router.get("/offers/:id", authMiddleware, OfferController.getOfferById);
router.delete("/offers/:id", authMiddleware, OfferController.deleteOffer);

export default router;
