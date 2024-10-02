import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { Client } from "@microsoft/microsoft-graph-client";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET, JWT_REFRESH_SECRET } from "../config.js";
import { ConfidentialClientApplication } from "@azure/msal-node";
import { LogLevel } from "@azure/msal-node";

const MSClientId = process.env.MICROSOFT_APP_CLIENT_ID;
const MS_TENANT_ID = process.env.MICROSOFT_APP_TENANT_ID;
const MSClientSecret = process.env.MICROSOFT_APP_CLIENT_SECRET;
const redirectUri = "http://localhost:3000/redirect/microsoft";

if (!MSClientId || !MSClientSecret) {
  throw new Error("MSClientId o MSClientSecret no están definidos en las variables de entorno.");
}

const authorityUrl = `https://login.microsoftonline.com/${MS_TENANT_ID}`;

console.log("\n");
console.log("MSClientId: ", MSClientId);
console.log("MS_TENANT_ID: ", MS_TENANT_ID);
console.log("MSClientSecret: ", MSClientSecret);
console.log("Authority URL:", authorityUrl);
console.log("Redirect URI:", redirectUri);
console.log("\n");

// * Compara una contraseña proporcionada por el usuario con una contraseña,
// * hasheada almacenada, para validar el acceso del usuario.
const verifyPassword = async (password, hashedPassword) => {
  return bcrypt.compareSync(password, hashedPassword);
};

// * Genera un access token JWT utilizando información del usuario, como el nombre de usuario y el correo electrónico.
// * Este token se utiliza para gestionar las sesiones y la autenticación a lo largo de la aplicación
const generateAccessToken = ({ username, email, picture, matricula }) => {
  const payload = { username, email, picture, matricula };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
};

// * Genera un refresh token JWT utilizando información del usuario, Este Token se utiliza para mantener l  a sesión
// * activa y refrescar el access token cuando sea necesario.
const generateRefreshToken = ({ username, email, picture, matricula }) => {
  const payload = { username, email, picture, matricula };
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

// * Verifica la validez de un access token JWT proporcionado. Utiliza la clave secreta de JWT_SECRET
// * para asegurar que el token es legítimo y no ha sido modificado
const verifyAccessToken = (token, secret = JWT_SECRET) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
};

// * Verifica la validez de un refresh token JWT proporcionado. Utiliza la clave secreta de JWT_REFRESH_SECRET
// * para asegurar que el token es legítimo y no ha sido modificado
const verifyRefreshToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
};

// * Esta función recibe un código de autorización y utiliza la API de Google para autenticar al usuario,
// * extrayendo y devolviendo sus datos principales como nombre, correo electrónico y foto de perfil.
const getGoogleUser = async (code) => {
  const oAuth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, "postmessage");
  try {
    if (!oAuth2Client) {
      console.log("OAuth2Client not defined");
      throw new Error("OAuth2Client not defined");
    }

    const { tokens } = await oAuth2Client.getToken(code);

    let payload;

    const ticket = await oAuth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID,
    });

    payload = ticket.getPayload();
    console.debug(`\nInformación del usuario de Google: ${JSON.stringify(payload)}`);

    const userGoogleData = {
      userName: payload.name,
      userEmail: payload.email,
      userPicture: payload.picture,
      sub: payload.sub,
    };
    return userGoogleData;
  } catch (error) {
    console.log("Error al intercambiar el código por tokens: ", err);
    res.status(401).send("Unauthorized");
  }
};

// * Esta función utiliza el código de autorización para autenticar y recuperar información básica del usuario de
// * Microsoft, Retorna esos datos para su uso en procesos de autenticación y registro.
const getMicrosoftUser = async (accessToken) => {
  try {
    const client = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });

    const payload = await client.api("/me").get();
    console.debug(`\nInformación del usuario de Microsoft: ${JSON.stringify(payload)}`);

    var userPicture = "/default_avatar_route.png";

    try {
      // Get the user's profile photo
      const photoResponse = await client.api("/me/photo/$value").get();
      // console.debug("photoResponse: ", photoResponse);

      // Check if the response is a fetch Response object
      if (photoResponse && typeof photoResponse.arrayBuffer === "function") {
        // Read the response as an ArrayBuffer
        const arrayBuffer = await photoResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString("base64");
        const mimeType = "image/jpeg";

        // Set the user picture as a Data URL
        userPicture = `data:${mimeType};base64,${base64Image}`;
        console.debug("Imagen de usuario de Microsoft obtenida correctamente");
      } else {
        console.log("Unexpected response type when fetching user photo.");
        throw new Error("Unexpected response type when fetching user photo.");
      }
    } catch (photoError) {
      if (photoError.code === "ErrorItemNotFound" || photoError.statusCode === 404) {
        console.log("El usuario no tiene una foto de perfil.");
        // Keep the default userPicture
      } else {
        console.log("Error al obtener la foto del usuario: ", photoError.toString());
        throw photoError;
      }
    }

    const userMicrosoftData = {
      userName: payload.displayName,
      userEmail: payload.mail || payload.userPrincipalName,
      userPicture: userPicture,
      id: payload.id,
    };
    return userMicrosoftData;
  } catch (error) {
    console.log("Error al obtener el usuario de Microsoft: ", error.toString());
    throw new Error("Error en la autenticación con Microsoft");
  }
};

export {
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  getGoogleUser,
  getMicrosoftUser,
};
