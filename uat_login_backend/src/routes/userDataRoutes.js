import express from "express";
import {
  saveUserUAT,
  getAllUserUATs,
  removeUserUAT,
  getUserProfile,
  updateUserProfileController,
  proxyUAT,
  deleteUser,
} from "../controllers/userDataController.js";
import { verifyUserToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// * Ruta para guardar UATs del usuario en la DB
router.post("/save_uat_data", verifyUserToken, saveUserUAT);

// * Ruta para obtener UATs del usuario en la DB
router.get("/get_uat_data", verifyUserToken, getAllUserUATs);

// * Ruta para eliminar una UAT del usuario de la DB
router.delete("/delete_uat_data", verifyUserToken, removeUserUAT);

// * Ruta para obtener datos de perfil del usuario
router.get("/profile", verifyUserToken, getUserProfile);

// - Ruta para obtener la url de la UAT y redirigir al cliente sin mostrar la url (*)
router.get("/proxy", verifyUserToken, proxyUAT);

// * Ruta para actualizar datos de perfil del usuario
router.put("/profile", verifyUserToken, updateUserProfileController);

// * Ruta para eliminar a un usuario de la DB
router.delete("/deleteUser", verifyUserToken, deleteUser);

export default router;
