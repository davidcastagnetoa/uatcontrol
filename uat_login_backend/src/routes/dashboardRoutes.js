import express from "express";
import { getDashboard } from "../controllers/dashboardController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stadistics", verifyToken, getDashboard);

export default router;
