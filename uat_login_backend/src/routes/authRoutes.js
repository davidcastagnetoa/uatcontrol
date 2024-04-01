import express from "express";
import { login, verifyTokenController } from "../controllers/authController.js";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { ConfidentialClientApplication, PublicClientApplication } from "@azure/msal-node";
import { db } from "../../utils/db.js";

import { Client } from "@microsoft/microsoft-graph-client";

const router = express.Router();

router.post("/login", login);
router.post("/verifyToken", verifyTokenController);

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const MS_CLIENT_ID = process.env.MICROSOFT_APP_CLIENT_ID;
const MS_CLIENT_SECRET = process.env.MICROSOFT_APP_CLIENT_SECRET;
const MS_TENANT_ID = process.env.MICROSOFT_APP_TENANT_ID;

// console.debug("CLIENT_ID:", CLIENT_ID);
// console.debug("CLIENT_SECRET:", CLIENT_SECRET);
console.debug("MS_CLIENT_ID:", MS_CLIENT_ID);
console.debug("MS_CLIENT_SECRET:", MS_CLIENT_SECRET);
console.debug("MS_TENANT_ID:", MS_TENANT_ID);

if (!CLIENT_ID) {
  console.error("Google client ID environment variable not set. Please add GOOGLE_CLIENT_ID to .env file.");
  throw new Error("Google client ID environment variable not set");
}

// ********************************
// Autenticación OAuth con Google
// ********************************

const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, "postmessage"); //Verificar que es "postmessage "
// console.debug("Valor del objeto oAuth2Client: " + JSON.stringify(oAuth2Client));
router.post("/auth/google", async (req, res) => {
  const { code } = req.body; // Esperamos recibir un 'code', no un 'token'
  // console.debug("Contenido de body: " + JSON.stringify(req.body));

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    // console.debug("Tokens recibidos: ", tokens);

    //Este await es importante. De lo contrario la funcion getPayload no podra ser llamada
    const ticket = await oAuth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    // console.log(`Información del usuario: ${JSON.stringify(payload)}`);

    // Buscar si el usuario ya existe en la base de datos por email
    db.get(`SELECT id FROM users WHERE email = ?`, [payload["email"]], async (err, row) => {
      if (err) {
        console.error("Error al buscar el usuario:", err.message);
        return res.status(500).send("Error al buscar el usuario en la base de datos");
      }

      let userId;
      if (!row) {
        // El usuario no existe, insértalo en users
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO users (username, email, picture, matricula) VALUES (?, ?, ?, ?)`,
            [payload["name"], payload["email"], payload["picture"], "AB1234"],
            function (err) {
              if (err) {
                console.error("Error al insertar el usuario:", err.message);
                reject(err);
              } else {
                userId = this.lastID; // Obtener el nuevo userID
                resolve();
              }
            }
          );
        });

        // Insertar en auth_methods
        db.run(
          `INSERT INTO auth_methods (user_id, auth_type, auth_details) VALUES (?, ?, ?)`,
          [userId, "google", payload["sub"]], // Usar 'sub' como auth_details
          (err) => {
            if (err) {
              console.error("Error al insertar método de autenticación Google:", err.message);
              return res.status(500).send("Error al procesar el método de autenticación");
            }
          }
        );
      } else {
        // El usuario ya existe, obtener su ID
        userId = row.id;
        console.debug(`El usuario ${payload["email"]} ya existe en la base de datos`);
        console.debug(`ID del usuario: ${userId}`);
        console.debug(`Tipo de autenticación: Google`);
        console.debug(`Detalles de autenticación: ${payload["sub"]}`); // Usar 'sub' como auth_details
        console.debug(`Matrícula: AB1234`);
        console.debug(`Username: ${payload["name"]}`);
        console.debug(`Email: ${payload["email"]}`);
      }

      // Genera un token usando el email de Google del usuario, el nombre y su ruta de imagen de perfil como carga util (payload)
      const userToken = jwt.sign(
        {
          username: payload["name"],
          email: payload["email"],
          picture: payload["picture"],
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );

      // console.debug("\nToken generado:", userToken)
      res.json({ userToken, userInfo: payload });
    });
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

// ******************************
// Autenticación con Microsoft
// ******************************
//

router.post("/auth/microsoft", async (req, res) => {
  const { authCode } = req.body;
  console.debug("authCode:", authCode);
  // Aquí deberías validar el authCode con Microsoft y obtener el token de acceso

  // Suponiendo que ya tienes el token de acceso y el cliente de Microsoft Graph configurado
  const client = Client.init({
    authProvider: (done) => {
      done(null, authCode); // Aquí se pasa el token de acceso
    },
  });

  try {
    const user = await client.api("/me").get();
    console.log("user data from /me endpoint: ", user);

    const jwtSecretKey = process.env.JWT_SECRET;
    const userName = user.displayName;
    const userEmail = user.mail || user.userPrincipalName;

    console.log("user email:", userEmail);
    console.log("user name:", userName);

    const userToken = jwt.sign(
      {
        email: userEmail,
        username: userName,
      },
      jwtSecretKey,
      {
        expiresIn: "1h",
      }
    );
    console.debug("\nToken generado:", userToken);

    res.json({
      token: userToken,
      user: {
        email: userEmail,
        username: userName,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

export default router;
