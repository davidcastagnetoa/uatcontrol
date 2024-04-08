import express from "express";
import { saveUserUAT, getAllUserUATs, removeUserUAT, getUserProfile } from "../controllers/userDataController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

//Ruta para guardar UATs del usuario en la DB
router.post("/save_uat_data", verifyToken, saveUserUAT);

//Ruta para obtener UATs del usuario en la DB
router.get("/get_uat_data", verifyToken, getAllUserUATs);

//Ruta para eliminar una UAT del usuario de la DB
router.delete("/delete_uat_data", verifyToken, removeUserUAT);

//Ruta para obtener datos de perfil del usuario
router.get("/profile", verifyToken, getUserProfile);

// EN DESARROLLO
// //Ruta para actualizar datos de perfil del usuario
// router.put("/profile", verifyToken, updateUserProfile);

export default router;
