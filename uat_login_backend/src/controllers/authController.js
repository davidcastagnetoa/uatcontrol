// authController.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { Client } from "@microsoft/microsoft-graph-client";
import { OAuth2Client } from "google-auth-library";

//Database
import { db, searchUserByEmail, insertUser } from "../../utils/db.js";

// Servicios
import { getUserByUsername, getUserById, checkUserExists, createUser } from "../services/userService.js";
import { verifyPassword, generateToken, verifyToken } from "../services/authService.js";

dotenv.config();

// Constantes requeridas
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, "postmessage"); //Verificar que es "postmessage "

// Control de credenciales y errores para debug
if (!CLIENT_ID) {
  console.error("Google client ID environment variable not set. Please add GOOGLE_CLIENT_ID to .env file.");
  throw new Error("Google client ID environment variable not set");
}
if (!CLIENT_SECRET) {
  console.error("Google Secret environment variable not set. Please add GOOGLE_CLIENT_SECRET to .env file.");
  throw new Error("Google Secret environment variable not set");
}
if (!oAuth2Client) {
  console.error("OAuth2Client not defined");
  throw new Error("OAuth2Client not defined");
}

/**
 * Esta funcion de autentificacion recibe el usuario y contraseña del la funcion login del cliente
 * en AuthProvider.js, y si son correctos genera y devuelve un token.
 * Si no son correctos devuelve un 401.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void}
 */
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "El nombre de usuario y la contraseña son requeridos" });
    }

    const user = await getUserByUsername(username);

    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado o no tiene autenticación local" });
    }

    const isPasswordCorrect = await verifyPassword(password, user.auth_details);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Credenciales no válidas" });
    }

    const payload = {
      username: user.username,
      email: user.email,
      picture: user.picture,
      matricula: user.matricula,
    };

    const token = generateToken(payload);
    res.json({ token, userData: user });
  } catch (error) {
    console.debug(error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Esta funcion verifica el token recibido por el cliente desde.
 * AuthProvider.js en el header de la peticion
 * verifica si el token es valido y extrae de él la informacion del usuario.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void}
 */
export const verifyTokenController = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token is missing" });
    }

    const decodedUser = await verifyToken(token);

    const userInfo = {
      valid: true,
      username: decodedUser.username || decodedUser.name,
      email: decodedUser.email,
      picture: decodedUser.picture,
      token: token,
    };

    res.json(userInfo);
  } catch (error) {
    console.log("Error in verifyTokenController:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Token verification failed" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Esta funcion da da alta a un usuario y registra sus datos en la base de datos
 * Si el usuario ya esta registrado devuelve un 409, o un 500 en caso de error,
 * Caso contrario, registra al usuario en las tablas users y auth_methods, genera un token
 * de authentificacion y responde con el token y los datos del usuario creado
 * Handles the signup process for a user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - The response object.
 */
export const signup = async (req, res) => {
  const { username, matricula, email, password } = req.body;

  if (!username || !matricula || !email || !password) {
    return res.status(400).json({ message: "Todos los campos son requeridos" });
  }

  try {
    const exists = await checkUserExists(email);
    if (exists) {
      return res.status(409).json({ message: "El email ya está registrado" });
    }

    const userId = await createUser(username, matricula, email, password);
    const user = await getUserById(userId);
    const token = generateToken(user);

    const payload = {
      username: user.username,
      email: user.email,
      matricula: user.matricula,
      picture: user.picture,
    };

    res.status(201).json({
      message: "Usuario creado exitosamente",
      token: token,
      userData: payload,
    });
  } catch (error) {
    console.error("Error en el controlador signup:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Esta funcion verifica la identidad del usuario mediante su cuenta de Microsoft
// Si la identidad es correcta devuelve los datos del usuario y un token
// Una vez que se verifica la identidad, se busca si el usuario ya existe
// en la base de datos por email, si el usuario no existe se inserta en la DB, en la tabla users y
// despues en auth_methods, Si ya existe obtiene su ID en la DB y responde con un token y los datos del usuario.
// Si la identidad es incorrecta devuevle un 401, Si no se puede guardar en la DB, devuelve un 500
export const loginWithMicrosoft = async (req, res) => {
  const { authCode } = req.body; // Esperamos recibir un 'authCode', no un 'token'
  let payload;

  const client = Client.init({
    authProvider: (done) => {
      done(null, authCode); // Aquí se pasa el token de acceso
    },
  });

  try {
    console.debug("\nControlador loginWithMicrosoft: Ejecutando try principal");
    console.debug("...:: Autentificando usuario con Microsoft ::...");
    const ticket = await client.api("/me");
    payload = await ticket.get();
  } catch (error) {
    console.log(error);
    res.status(401).send("Unauthorized");
  }

  try {
    console.debug("\nControlador loginWithMicrosoft: Ejecutando siguiente try");
    // let { displayName: userName, userPrincipalName: userEmail } = payload;

    let userName = payload.displayName;
    let userEmail = payload.mail || payload.userPrincipalName;
    let userMatricula = "unregistered";
    let userPicture = "/default_avatar_route.png"; // EN DESARROLLO
    let userRoll = "usuario"; // Por defecto  todos los usuarios son default, solo los administradores pueden cambiar el roll de los usuarios

    console.debug("Contenido de payload de Microsoft: ", payload);

    // Buscamos al usuario en la base de datos por email de Microsoft
    let row = await searchUserByEmail(userEmail);

    if (!row) {
      // Usuario de Microsoft no existe, insertamos al nuevo usuario
      const userId = await insertUser(userName, userEmail, userPicture, userMatricula, userRoll);
      console.log(`Usuario nuevo insertado con ID: ${userId}`);
    } else {
      // Usuario de Microsoft ya existe, actualizar variables con datos de `row`
      console.debug("Usuario encontrado, valores de row: ", row);

      userName = row?.username;
      userMatricula = row?.matricula;
      userEmail = row?.email;
      userPicture = row?.picture;
      userRoll = row?.usergroup;
    }

    // Generamos un token JWT
    const userToken = jwt.sign(
      {
        username: userName,
        email: userEmail,
        picture: userPicture,
        matricula: userMatricula,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    console.debug("\nToken generado:", userToken);

    res.json({
      token: userToken,
      user: {
        username: userName,
        email: userEmail,
        picture: userPicture,
        matricula: userMatricula,
        rol: userRoll,
      },
    });
  } catch (err) {
    console.error("Error al manejar la base de datos: ", err);
    return res.status(500).send("Internal Server Error");
  }
};

// Esta funcion verifica la identidad del usuario mediante su cuenta de Google
// Espera recibir un codigo, que no es un token, en el body de la peticion
// Mediante el objeto oAuth2Client se verifica la identidad del usuario y se obtiene un token
// Despues el mismo objeto verifica el token con el metodo verifyIdToken y obtiene una carga
// util que contiene los datos del usuario. Despues busca si el usuario ya existe en la base de datos por email
// si el usuario no existe se inserta en la DB, en la tabla users y
// despues en auth_methods, Si ya existe obtiene su ID en la DB y responde con un token y los datos del usuario.
// Si la identidad es incorrecta devuevle un 401, Si no se puede guardar en la DB, devuelve un 500
export const loginWithGoogle = async (req, res) => {
  const { code } = req.body; // Esperamos recibir un 'code', no un 'token'
  const { tokens } = await oAuth2Client.getToken(code);
  // console.debug("Tokens recibidos: ", tokens);
  let payload;

  try {
    console.debug("Controlador loginWithGoogle: Ejecutando try principal");
    console.debug("...:: Autentificando usuario con Google ::...");
    //Este await es importante. De lo contrario la funcion getPayload no podra ser llamada
    const ticket = await oAuth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: CLIENT_ID,
    });

    payload = ticket.getPayload();
    console.debug(`\nInformación del usuario en controlador de Google: ${JSON.stringify(payload)}`);
  } catch (err) {
    console.error("Error al intercambiar el código por tokens: ", err);
    res.status(401).send("Unauthorized");
  }

  try {
    console.debug("\nControlador loginWithGoogle: Ejecutando siguiente try");
    let { name: userName, email: userEmail, picture: userPicture } = payload;
    let userMatricula = "unregistered";
    let userRoll = "usuario"; // Por defecto  todos los usuarios son default, solo los administradores pueden cambiar el roll de los usuarios

    // Buscamos al usuario en la base de datos por email de Google
    let row = await searchUserByEmail(userEmail);

    if (!row) {
      // Usuario de Google no existe, insertamos al nuevo usuario
      const userId = await insertUser(userName, userEmail, userPicture, userMatricula, userRoll);
      console.log(`Usuario nuevo insertado con ID: ${userId}`);
    } else {
      // Usuario de Google ya existe, actualizar variables con datos de `row`
      console.debug("Usuario encontrado, valores de row: ", row);

      userName = row?.username;
      userMatricula = row?.matricula;
      userEmail = row?.email;
      userPicture = row?.picture;
      userRoll = row?.usergroup;
    }

    // Generamos un token JWT
    const userToken = jwt.sign(
      {
        username: userName,
        email: userEmail,
        picture: userPicture,
        matricula: userMatricula,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    console.debug("\nToken generado:", userToken);
    res.json({
      userToken,
      userInfo: {
        username: userName,
        email: userEmail,
        picture: userPicture,
        matricula: userMatricula,
        rol: userRoll,
      },
    });
  } catch (err) {
    console.error("Error al manejar la base de datos: ", err);
    return res.status(500).send("Internal Server Error");
  }
};

// // EXPERIMENTAL, EN DESARROLLO

// // Esta funcion recibe el token recibido por el cliente desde
// // ProfilePage.js para actualizar los datos del usuario autenticado.
// // Verificamos que el token sea correcto y luego actualizamos los campos
// // correspondientes con los nuevos valores enviados por el cliente.
// export const updateUser = async (req, res) => {
//   const token = req.body.token;
//   let user = await User.findByToken(token);

//   // Comprobamos que el token sea correcto
//   if (!user) return res.status(401).json({ message: "No autorizado" });

//   // Actualizamos los campos del usuario
//   user = await User.update(user._id, req.body);

//   // Devolvemos al usuario actualizado
//   res.json(user);
// };

// // Funcion encargada de cerrar la sesión del usuario autenticado.
// // Envia un token vacío al cliente para que se desconecte.
// // EXPERIMENTAL, EN DESARROLLO
// export const logout = (req, res) => {
//   res.json({ token: "" });
// };
