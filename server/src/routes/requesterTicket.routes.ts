import { Router } from "express";
import {
  createRequesterTicket,
  getMyTicket,
  getMyTickets,
} from "../controllers/requesterTicket.controller.js";
import { requireRequesterAuth } from "../middleware/requesterAuth.middleware.js";
import { requireActiveTenant } from "../middleware/tenant.middleware.js";

const router = Router();

router.use(requireRequesterAuth);
router.use(requireActiveTenant);

router.post("/", createRequesterTicket);
router.get("/", getMyTickets);
router.get("/:ticketId", getMyTicket);

export default router;
