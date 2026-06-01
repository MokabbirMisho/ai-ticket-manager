import { Router } from "express";
import {
  createTicket,
  getTicket,
  listTickets,
  updateTicket,
} from "../controllers/ticket.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", listTickets);
router.post("/", createTicket);
router.get("/:id", getTicket);
router.patch("/:id", updateTicket);

export default router;
