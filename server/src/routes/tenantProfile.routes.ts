import { Router } from "express";
import {
  getTenantProfile,
  updateTenantProfile,
} from "../controllers/tenantProfile.controller.js";
import { requireTenantAdmin } from "../middleware/auth.middleware.js";
import {
  requireActiveTenant,
  requireTenant,
} from "../middleware/tenant.middleware.js";

const router = Router();

router.use(requireTenantAdmin);
router.use(requireTenant);
router.use(requireActiveTenant);

router.get("/profile", getTenantProfile);
router.patch("/profile", updateTenantProfile);

export default router;
