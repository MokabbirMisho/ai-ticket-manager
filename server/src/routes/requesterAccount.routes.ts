import { Router } from "express";
import {
  getRequesterAccount,
  updateRequesterAccount,
  updateRequesterPassword,
} from "../controllers/requesterAccount.controller.js";
import { requireRequesterAuth } from "../middleware/requesterAuth.middleware.js";
import { requireActiveTenant } from "../middleware/tenant.middleware.js";

const router = Router();

router.use(requireRequesterAuth);
router.use(requireActiveTenant);

router.get("/", getRequesterAccount);
router.patch("/", updateRequesterAccount);
router.patch("/password", updateRequesterPassword);

export default router;
