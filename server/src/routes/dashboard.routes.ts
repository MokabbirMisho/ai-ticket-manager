import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/stats", getDashboardStats);

export default router;
