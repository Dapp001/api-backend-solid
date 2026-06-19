import express from "express";
import { sendNotification } from "../controllers/notification.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/send", authMiddleware, sendNotification);

export default router;