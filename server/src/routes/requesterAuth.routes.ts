import { Router } from "express";
import {
  getRequesterMe,
  loginRequester,
  logoutRequester,
  registerRequester,
} from "../controllers/requesterAuth.controller.js";

const router = Router();

router.post("/register", registerRequester);
router.post("/login", loginRequester);
router.post("/logout", logoutRequester);
router.get("/me", getRequesterMe);

export default router;
