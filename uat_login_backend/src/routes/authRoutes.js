import express from "express";
import { login, verifyTokenController } from "../controllers/authController.js";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { ConfidentialClientApplication } from "@azure/msal-node";

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
// console.debug("MS_CLIENT_ID:", MS_CLIENT_ID);
// console.debug("MS_CLIENT_SECRET:", MS_CLIENT_SECRET);
// console.debug("MS_TENANT_ID:", MS_TENANT_ID);

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
    console.log(`Información del usuario: ${JSON.stringify(payload)}`);

    //Genera un token usando el email de Google del usuario, el nombre y su ruta de imagen de perfil como carga util (payload)
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

    // console.debug("\nToken generado:", userToken);
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

// ******************************
// Autenticación con Microsoft
// ******************************

const msalConfig = {
  auth: {
    clientId: MS_CLIENT_ID, //MICROSOFT_APP_CLIENT_ID
    clientSecret: MS_CLIENT_SECRET, //MICROSOFT_APP_CLIENT_SECRET
    authority: `https://login.microsoftonline.com/${MS_TENANT_ID}`,
  },
};

const pca = new ConfidentialClientApplication(msalConfig);
router.post("/auth/microsoft", async (req, res) => {
  const { code } = req.body; // Esperamos recibir un 'code', no un 'token'
  console.debug("Contenido de body: " + JSON.stringify(req.body));
  try {
    const tokenRequest = {
      code: code,
      scopes: ["User.Read"],
      redirectUri: "postmessage", //http://localhost:3000
    };

    const response = await pca.acquireTokenByCode(tokenRequest);
    console.debug(`Response received from token endpoint. ${response}`);

    if (response.accessToken) {
      // console.debug("Access token:", response.accessToken);
      // res.redirect(`/?id_token=${response.accessToken}&state=signin`);

      // Utilizar el access token para hacer una solicitud a Microsoft Graph API y obtener datos del perfil del usuario.
      const graphResponse = await fetch("https://graph.microsoft.com/v1.0/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${response.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const userData = await graphResponse.json();
      console.debug("Datos del usuario:", JSON.stringify(userData));

      const userEmail = userData.mail || userData.userPrincipalName; // Correo electrónico del usuario
      const userName = userData.displayName;
      // Generar el Token JWT
      const jwtSecretKey = process.env.JWT_SECRET;
      const userToken = jwt.sign(
        {
          email: userEmail,
          name: userName,
        },
        jwtSecretKey,
        {
          expiresIn: "1h",
        }
      );
      // console.debug("\nToken generado:", userToken);
      res.json({
        token: userToken,
        user: {
          email: userEmail,
          name: userName,
        },
      });
    } else {
      console.error(
        "Error en la solicitud de acceso al código, acquireTokenByCode failed! , Verifica las credenciales de Microsoft"
      );
      throw new Error("No hay Respuesta por parte de Microsoft Graph API");
    }

    // Completa el codigo para generar un token usando el email de Microsft del usuario y su nombre con jwt
    // ademas debe responder en formato json con el token generado y la informacion del usuario
  } catch (err) {
    console.log(err);
    console.dir(err);
    res.status(500).send(err);
  }
});

export default router;
