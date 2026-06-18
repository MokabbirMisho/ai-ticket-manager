import { Router } from "express";
import {
  activateTenant,
  createTenant,
  deactivateTenant,
  getAllTenants,
  getTenantById,
  updateTenant,
  updateTenantSubscription,
} from "../controllers/superTenant.controller.js";
import { requireSuperAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireSuperAdmin);

router.get("/", getAllTenants);
router.post("/", createTenant);
router.get("/:id", getTenantById);
router.patch("/:id", updateTenant);
router.patch("/:id/subscription", updateTenantSubscription);
router.patch("/:id/deactivate", deactivateTenant);
router.patch("/:id/activate", activateTenant);

export default router;
