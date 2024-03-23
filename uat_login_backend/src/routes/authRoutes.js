import express from "express";
import { login, verifyTokenController } from "../controllers/authController.js";
import passport from "passport";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/login", login);
router.post("/verifyToken", verifyTokenController);

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// console.debug("CLIENT_ID:", CLIENT_ID);
// console.debug("CLIENT_SECRET:", CLIENT_SECRET);

if (!CLIENT_ID) {
  console.error("Google client ID environment variable not set. Please add GOOGLE_CLIENT_ID to .env file.");
  throw new Error("Google client ID environment variable not set");
}

const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, "postmessage");
// console.debug("Valor del objeto oAuth2Client: " + JSON.stringify(oAuth2Client));

// Rutas de autenticación OAuth con Passport
router.post("/auth/google", async (req, res) => {
  const { code } = req.body; // Esperamos recibir un 'code', no un 'token'
  console.debug("Contenido de body: " + JSON.stringify(req.body));

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    console.log("Tokens recibidos: ", tokens);

    const ticket = await oAuth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    console.log(`Información del usuario: ${JSON.stringify(payload)}`);

    //Genera un token usando el email de Google del usuario y el nombre como carga util (payload)
    const userToken = jwt.sign(
      {
        username: payload["name"],
        email: payload["email"],
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    console.log("\nToken generado:", userToken);
    res.json({ userToken, userInfo: payload });
  } catch (err) {
    console.error("Error al intercambiar el código por tokens: ", err);
    res.status(401).send("Unauthorized");
  }
});

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
