import { Router } from "express";
import {
  createStudent,
  deactivateStudent,
  listStudents,
  updateStudent,
} from "../controllers/student.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";
import { requireTenant } from "../middleware/tenant.middleware.js";

const router = Router();

router.use(requireAuth);
router.use(requireAdmin);
router.use(requireTenant);

router.get("/", listStudents);
router.post("/", createStudent);
router.patch("/:id", updateStudent);
router.delete("/:id", deactivateStudent);

export default router;
