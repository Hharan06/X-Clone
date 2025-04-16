import express from "express"
import { followUnfollowUser, getProfile, getSuggestedUsers, updateUser } from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/getProfile/:username",protectRoute, getProfile);
router.post("/follow/:id",protectRoute,followUnfollowUser);
router.get("/suggested",protectRoute,getSuggestedUsers);
router.post("/updateUser",protectRoute,updateUser)

export default router;