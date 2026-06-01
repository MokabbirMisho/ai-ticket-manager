import { Router } from "express";
import {
  getStudentMe,
  loginStudent,
  logoutStudent,
  registerStudent,
} from "../controllers/studentAuth.controller.js";

const router = Router();

router.post("/register", registerStudent);
router.post("/login", loginStudent);
router.post("/logout", logoutStudent);
router.get("/me", getStudentMe);

export default router;
