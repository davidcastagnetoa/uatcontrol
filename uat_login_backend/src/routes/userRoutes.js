import express from "express";
import { saveUserData } from "../controllers/userDataController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/save-data", verifyToken, saveUserData);

export default router;
