import express from "express";
import {
  login,
  signup,
  loginWithMicrosoft,
  loginWithGoogle,
  refreshNativeToken,
  verifyTokenController,
} from "../controllers/authController.js";
import { UserRefreshClient } from "google-auth-library";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "../config.js";

const router = express.Router();

//  * Ruta de alta con usuario , email, matrícula y contraseña
router.post("/signup", signup);

//  * Ruta de verificacion de identidad del usuario
router.post("/verifyToken", verifyTokenController);

//  *Ruta de login con usuario y contraseña
router.post("/login", login);

//  * Ruta de Autenticación con Microsoft
router.post("/auth/microsoft", loginWithMicrosoft);

//  * Ruta de Autenticación OAuth con Google
router.post("/auth/google", loginWithGoogle);

//* Ruta de Refresh Token para obtener un nuevo token de acceso
router.post("/refresh_token", refreshNativeToken);

export default router;
