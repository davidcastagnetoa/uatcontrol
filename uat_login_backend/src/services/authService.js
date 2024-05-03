import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";

dotenv.config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, "postmessage");

/**
 * Compara una contraseña proporcionada por el
 * usuario con una contraseña hasheada almacenada
 * para validar el acceso del usuario.
 * */
const verifyPassword = async (password, hashedPassword) => {
  return bcrypt.compareSync(password, hashedPassword);
};

/**
 * Genera un token JWT utilizando información del usuario, como el
 * nombre de usuario y el correo electrónico. Este token se utiliza
 * para gestionar las sesiones y la autenticación a lo largo de la aplicación
 * */
const generateToken = ({ username, email, picture, matricula }) => {
  const payload = { username, email, picture, matricula };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
};

/**
 * Verifica la validez de un token JWT proporcionado. Utiliza la
 * clave secreta de JWT para asegurar que
 * el token es legítimo y no ha sido modificado
 * */
const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
};

/**
 * */
const getGoogleUser = async (code) => {
  try {
    const { tokens } = await oAuth2Client.getToken(code);

    let payload;

    const ticket = await oAuth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: CLIENT_ID,
    });

    payload = ticket.getPayload();
    console.debug(`\nInformación del usuario de Google: ${JSON.stringify(payload)}`);

    const userGoogleData = {
      userName: payload.name,
      userEmail: payload.email,
      userPicture: payload.picture,
    };
    return userGoogleData;
  } catch (error) {
    console.error("Error al intercambiar el código por tokens: ", err);
    res.status(401).send("Unauthorized");
  }
};

export { verifyPassword, generateToken, verifyToken, getGoogleUser };
