import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  requireActiveTenant,
  requireTenant,
} from "../middleware/tenant.middleware.js";

const router = Router();

router.use(requireAuth);
router.use(requireTenant);
router.use(requireActiveTenant);

router.get("/stats", getDashboardStats);

export default router;
