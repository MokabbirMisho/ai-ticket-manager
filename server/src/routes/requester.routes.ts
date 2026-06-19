import { Router } from "express";
import {
  createRequester,
  deactivateRequester,
  getRequester,
  listRequesters,
  updateRequester,
} from "../controllers/requester.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";
import {
  requireActiveTenant,
  requireTenant,
} from "../middleware/tenant.middleware.js";

const router = Router();

router.use(requireAuth);
router.use(requireAdmin);
router.use(requireTenant);
router.use(requireActiveTenant);

router.get("/", listRequesters);
router.get("/:id", getRequester);
router.post("/", createRequester);
router.patch("/:id", updateRequester);
router.delete("/:id", deactivateRequester);

export default router;
