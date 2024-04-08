import express from "express";
import { getUATsStatistics, getAllUsers } from "../controllers/dashboardController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

//Ruta para obtener las estadisticas de las UATs del usuario en la DB
router.get("/stadistics", verifyToken, getUATsStatistics);

//Ruta para obtener todos los usuarios de la DB, solo para usuarios con privilegios de administrador
router.get("/user_lists", verifyToken, getAllUsers);

export default router;
