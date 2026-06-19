import { Router } from "express";
import {
  createAgent,
  deactivateUser,
  listUsers,
  updateUser,
} from "../controllers/user.controller.js";
import { requireAdmin } from "../middleware/auth.middleware.js";
import {
  requireActiveTenant,
  requireTenant,
} from "../middleware/tenant.middleware.js";

const router = Router();

router.use(requireAdmin);
router.use(requireTenant);
router.use(requireActiveTenant);

router.get("/", listUsers);
router.post("/", createAgent);

router.patch("/:id", updateUser);
router.delete("/:id", deactivateUser);

export default router;
