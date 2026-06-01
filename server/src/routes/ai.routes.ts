import { Router } from "express";
import {
  summarizeTicket,
  generateReply,
  classifyTicket,
} from "../controllers/ai.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.post("/summary/:ticketId", summarizeTicket);
router.post("/reply/:ticketId", generateReply);
router.post("/classify/:ticketId", classifyTicket);

export default router;
