import { Router } from "express";
import {
  createArticle,
  deleteArticle,
  getArticle,
  getArticles,
  updateArticle,
} from "../controllers/knowledge.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);
router.use(requireAdmin);

router.route("/").get(getArticles).post(createArticle);

router.route("/:id").get(getArticle).patch(updateArticle).delete(deleteArticle);

export default router;
