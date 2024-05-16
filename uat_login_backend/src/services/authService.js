import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { Client } from "@microsoft/microsoft-graph-client";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET, JWT_REFRESH_SECRET } from "../config.js";

// * Compara una contraseña proporcionada por el usuario con una contraseña,
// * hasheada almacenada, para validar el acceso del usuario.
const verifyPassword = async (password, hashedPassword) => {
  return bcrypt.compareSync(password, hashedPassword);
};

// * Genera un access token JWT utilizando información del usuario, como el nombre de usuario y el correo electrónico.
// * Este token se utiliza para gestionar las sesiones y la autenticación a lo largo de la aplicación
const generateAccessToken = ({ username, email, picture, matricula }) => {
  const payload = { username, email, picture, matricula };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1min" });
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
      console.error("OAuth2Client not defined");
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
    console.error("Error al intercambiar el código por tokens: ", err);
    res.status(401).send("Unauthorized");
  }
};

// * Esta función utiliza el código de autorización para autenticar y recuperar información básica del usuario de
// * Microsoft, Retorna esos datos para su uso en procesos de autenticación y registro.
const getMicrosoftUser = async (authCode) => {
  const client = Client.init({
    authProvider: (done) => {
      done(null, authCode); // - Autenticar con el código proporcionado
    },
  });

  try {
    const payload = await client.api("/me").get();
    console.debug(`\nInformación del usuario de Microsoft: ${JSON.stringify(payload)}`);
    return {
      userName: payload.displayName,
      userEmail: payload.mail || payload.userPrincipalName,
      userPicture: "/default_avatar_route.png", // Asumiendo una imagen predeterminada
      id: payload.id,
    };
  } catch (error) {
    console.error("Error al obtener el usuario de Microsoft: ", error);
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
