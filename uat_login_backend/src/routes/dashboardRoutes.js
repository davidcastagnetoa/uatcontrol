import express from "express";
import { getUATsStatistics } from "../controllers/dashboardController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stadistics", verifyToken, getUATsStatistics);

export default router;
