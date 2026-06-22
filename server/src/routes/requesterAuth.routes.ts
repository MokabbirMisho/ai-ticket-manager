import { Router } from "express";
import {
  forgotRequesterPassword,
  getRequesterMe,
  loginRequester,
  logoutRequester,
  registerRequester,
  resetRequesterPasswordController,
} from "../controllers/requesterAuth.controller.js";

const router = Router();

router.post("/register", registerRequester);
router.post("/login", loginRequester);
router.post("/logout", logoutRequester);
router.post("/forgot-password", forgotRequesterPassword);
router.post("/reset-password", resetRequesterPasswordController);
router.get("/me", getRequesterMe);

export default router;
