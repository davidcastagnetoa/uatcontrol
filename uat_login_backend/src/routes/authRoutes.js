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

// // Autenticación con Microsoft
// const msalConfig = {
//   auth: {
//     clientId: MS_CLIENT_ID,
//     clientSecret: MS_CLIENT_SECRET,
//     authority: `https://login.microsoftonline.com/${MS_TENANT_ID}/oauth2/v2.0/token`,
//     grant_type: "authorization_code",
//     // authority: `https://${MS_TENANT_ID}.ciamlogin.com/`,
//   },
// };

// const pca = new ConfidentialClientApplication(msalConfig);

// router.post("/auth/microsoft", async (req, res) => {
//   console.info("\nIniciando peticion de autenticacion a Microsoft...");
//   const { code, codeVerifier } = req.body; // Esperamos recibir un 'code', no un 'token'
//   console.debug("\nContenido de body: " + JSON.stringify(req.body));
//   const code_verifier = codeVerifier;

//   try {
//     const tokenRequest = {
//       code,
//       scopes: ["https://graph.microsoft.com/User.Read"],
//       redirectUri: "http://localhost:3000/redirect/microsoft",
//       code_verifier, // Añadido code_verifier en la solicitud de token
//       grant_type: "authorization_code",
//     };

//     console.debug("\nThe tokenRequest object: ", tokenRequest);

//     const response = await pca.acquireTokenByCode(tokenRequest);
//     console.debug(`Response received from token endpoint using pca: ${response}`);

//     const homeAccountId = response.account.homeAccountId;
//     console.debug("The homeAccountId object: ", homeAccountId);

//     res.json(response);

//     // if (response) {
//     //   console.debug("Access token:", response.accessToken);
//     //   res.redirect(`/?id_token=${response.accessToken}&state=signin`);

//     //   // Utilizar el access token para hacer una solicitud a
//     //   // Microsoft Graph API y obtener datos del perfil del usuario.
//     //   const graphResponse = await fetch("https://graph.microsoft.com/v1.0/me", {
//     //     method: "GET",
//     //     headers: {
//     //       Authorization: `Bearer ${response.accessToken}`,
//     //       "Content-Type": "application/json",
//     //     },
//     //   });

//     //   if (!graphResponse.ok) {
//     //     throw new Error("Error fetching user data from Microsoft Graph");
//     //   }

//     //   const userData = await graphResponse.json();
//     //   console.debug("Datos del usuario:", JSON.stringify(userData));

//     //   const userEmail = userData.mail || userData.userPrincipalName || userData.email || "Revisa userData"; // Correo electrónico del usuario
//     //   const userName = userData?.displayName;

//     //   // Ahora generas un JWT con la información del usuario
//     //   const jwtSecretKey = process.env.JWT_SECRET;
//     //   const userToken = jwt.sign(
//     //     {
//     //       email: userEmail,
//     //       name: userName,
//     //     },
//     //     jwtSecretKey,
//     //     {
//     //       expiresIn: "1h",
//     //     }
//     //   );
//     //   console.debug("\nToken generado:", userToken);

//     //   res.json({
//     //     token: userToken,
//     //     user: {
//     //       email: userEmail,
//     //       name: userName,
//     //     },
//     //   });
//     // } else {
//     //   console.log(
//     //     "Error en la solicitud de acceso al código, acquireTokenByCode failed! , Verifica las credenciales de Microsoft"
//     //   );
//     //   throw new Error("No hay Respuesta por parte de Microsoft Graph API");
//     // }
//   } catch (err) {
//     console.log(err);
//     res.status(500).send(err);
//   }
// });

// *************
// Experimental
// *************

router.post("/api/auth/microsoft", async (req, res) => {
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
    const token = jwt.sign({ user: user.displayName }, process.env.JWT_SECRET);

    res.json({
      token,
      user: {
        name: user.displayName,
        email: user.mail || user.userPrincipalName,
        profileImage: user.photo, // Necesitarás un endpoint adicional para obtener la foto
      },
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

export default router;
