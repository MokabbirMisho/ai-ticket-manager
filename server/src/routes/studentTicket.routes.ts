import { Router } from "express";
import {
  createStudentTicket,
  getMyTicket,
  getMyTickets,
} from "../controllers/studentTicket.controller.js";
import { requireStudentAuth } from "../middleware/studentAuth.middleware.js";
import { requireActiveTenant } from "../middleware/tenant.middleware.js";

const router = Router();

router.use(requireStudentAuth);
router.use(requireActiveTenant);

router.post("/", createStudentTicket);
router.get("/", getMyTickets);
router.get("/:ticketId", getMyTicket);

export default router;
