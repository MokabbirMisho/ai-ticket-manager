import { Router } from "express";
import { resetUserPassword } from "../controllers/superUser.controller.js";
import { requireSuperAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireSuperAdmin);

router.patch("/:userId/reset-password", resetUserPassword);

export default router;
