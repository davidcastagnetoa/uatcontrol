import express from "express";
import { saveUserUAT, getUserUATs } from "../controllers/userDataController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

//Ruta para guardar UATs del usuario en la DB
router.post("/save_uat_data", verifyToken, saveUserUAT);

//Ruta para obtener UATs del usuario en la DB
router.get("/get_uat_data", verifyToken, getUserUATs);

//Ruta para eliminar una UAT del usuario de la DB
// router.get("/delete-uat_data", verifyToken, removeUserUAT);

//Ruta para obtener datos de perfil del usuario
// router.get("/profile", verifyToken, getUserProfile);

//Ruta para actualizar datos de perfil del usuario
// router.put("/profile", verifyToken, updateUserProfile);

export default router;
