import express from "express";
import { getUATsStatistics, getAllUsers } from "../controllers/dashboardController.js";
import { verifyUserToken } from "../middleware/authMiddleware.js";

const router = express.Router();

//* Ruta para obtener las estadisticas de las UATs del usuario en la DB
router.get("/stadistics", verifyUserToken, getUATsStatistics);

//* Ruta para obtener todos los usuarios de la DB, sólo para administradores
router.get("/user_lists", verifyUserToken, getAllUsers);

export default router;
