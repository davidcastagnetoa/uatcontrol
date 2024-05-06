import express from "express";
import {
  login,
  signup,
  loginWithMicrosoft,
  loginWithGoogle,
  verifyTokenController,
} from "../controllers/authController.js";

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

//! EN DESARROLLO, NO EN USO
// * Ruta de Refresh Token de Google
router.post("/auth/google/refresh-token", async (req, res) => {
  try {
    const user = new UserRefreshClient(CLIENT_ID, CLIENT_SECRET, req.body.refreshToken);
    const { credentials } = await user.refreshAccessToken(); // optain new tokens
    res.json(credentials);
  } catch (err) {
    console.error("Ha ocurrido un error al verificar el token: " + err);
    res.status(401).send("Unauthorized");
  }
});

export default router;
