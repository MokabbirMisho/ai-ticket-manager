import { Router } from "express";
import {
  changePassword,
  getMe,
  login,
  logout,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/login", login);
router.post("/logout", logout);
router.get("/me", getMe);
router.patch("/change-password", requireAuth, changePassword);

export default router;
