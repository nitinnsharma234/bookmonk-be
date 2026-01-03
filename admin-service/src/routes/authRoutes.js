import { Router } from "express";
import {
  asyncHandler,
  authenticateToken,
  requireAdmin,
} from "@bookzilla/shared";
import authController from "../controllers/authController.js";

const router = Router();

router.post("/login", asyncHandler(authController.login.bind(authController)));

export default router;
