import express from "express";
import {
  login,
  signup,
  loginWithMicrosoft,
  loginWithGoogle,
  verifyTokenController,
} from "../controllers/authController.js";

const router = express.Router();

// Darse de alta con usuario , email, matricula y contraseña
router.post("/signup", signup);

// Verificar identidad del usuario
router.post("/verifyToken", verifyTokenController);

// Logarse con usuario y contraseña
router.post("/login", login);

// Autenticación con Microsoft
router.post("/auth/microsoft", loginWithMicrosoft);

// Autenticación OAuth con Google
router.post("/auth/google", loginWithGoogle);

// Refresh Token de Google, EN DESARROLLO, NO EN USO
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
