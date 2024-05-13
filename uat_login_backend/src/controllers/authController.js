// authController.js

// Servicios
import {
  getUserByUsername,
  getUserById,
  checkUserExists,
  createUser,
  insertOrUpdateGoogleUser,
  insertOrUpdateMicrosoftUser,
} from "../services/userService.js";

import {
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  getGoogleUser,
  getMicrosoftUser,
  verifyToken,
  verifyRefreshToken,
} from "../services/authService.js";

// * Esta función de autentificación recibe el usuario y contraseña del la funcion login del cliente
// * en AuthProvider.js, y si son correctos genera y devuelve un token. Si no son correctos devuelve un 401.
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

    const token = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.cookie("accessToken", token, { httpOnly: true, secure: true, sameSite: "Strict" });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "Strict" });

    res.json({ token, refreshToken, userData: user });
  } catch (error) {
    console.debug(error);
    res.status(500).json({ message: error.message });
  }
};

//  * Esta función verifica el token recibido por el cliente desde. AuthProvider.js en el header de la peticion
//  * verifica si el token es valido y extrae de él la informacion del usuario.
export const verifyTokenController = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      console.log("No token found");
      return res.status(401).json({ message: "Token is missing" });
    }

    let decodedUser;
    let newAccessToken;

    try {
      // Verificar token de acceso
      decodedUser = await verifyToken(token);
      console.log("Decoded user from access token:", decodedUser);
    } catch (accessTokenError) {
      console.log("Token de acceso fallido, probando token de refresco");

      try {
        decodedUser = await verifyRefreshToken(token);
        console.log("Decoded user from refresh token:", decodedUser);

        // Generar un nuevo token de acceso
        newAccessToken = generateAccessToken({
          username: decodedUser.username,
          email: decodedUser.email,
          picture: decodedUser.picture,
          matricula: decodedUser.matricula,
        });

        console.log("Nuevo token de acceso generado:", newAccessToken);
      } catch (refreshTokenError) {
        console.log("Token de refresco fallido, revisa servicios");
        return res.status(403).json({ message: "Token verification failed" });
      }
    }

    const userInfo = {
      valid: true,
      username: decodedUser.username || decodedUser.name,
      email: decodedUser.email,
      picture: decodedUser.picture,
      token: newAccessToken || token,
    };

    res.json(userInfo);
  } catch (error) {
    console.log("\nError in verifyTokenController:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Token verification failed" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

//  * Esta función da da alta a un usuario y registra sus datos en la DB. Si ya esta registrado devuelve un 409, o un 500
//  * en caso de error. Caso contrario, registra al usuario en DB, genera y devuelve un token con los datos del usuario creado
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

    const payload = {
      username: user.username,
      email: user.email,
      matricula: user.matricula,
      picture: user.picture,
    };

    const token = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.status(201).json({
      message: "Usuario creado exitosamente",
      token: token,
      userData: payload,
      refreshToken: refreshToken,
    });
  } catch (error) {
    console.error("Error en el controlador signup:", error.message);
    res.status(500).json({ message: error.message });
  }
};

//  * Esta función gestiona el proceso de inicio de sesión utilizando cuentas de Google. Autentica y registra o
//  * actualiza usuarios mediante Google OAuth2, devolviendo un token JWT y los datos del usuario.
export const loginWithGoogle = async (req, res) => {
  const { code } = req.body;

  try {
    const { userName, userEmail, userPicture, sub } = await getGoogleUser(code);

    const userData = await insertOrUpdateGoogleUser(userName, userEmail, userPicture, undefined, undefined, sub);

    const googlePayload = {
      username: userData.username,
      email: userData.email,
      picture: userData.picture,
      matricula: userData.matricula,
      rol: userData.usergroup,
    };

    const accessToken = generateAccessToken(googlePayload);
    const refreshToken = generateRefreshToken(googlePayload);
    res.status(200).json({
      accessToken,
      refreshToken,
      userInfo: googlePayload,
    });
  } catch (err) {
    console.error("Error en loginWithGoogle:", err);
    res.status(err.status || 500).send(err.message || "Internal Server Error");
  }
};

//  * Esta función autentica a los usuarios mediante Microsoft OAuth, recuperando y gestionando sus datos
//  * desde la DB para luego generar un token JWT. Devuelve el token y los datos del usuario.
export const loginWithMicrosoft = async (req, res) => {
  const { authCode } = req.body;

  try {
    const { userName, userEmail, userPicture, id } = await getMicrosoftUser(authCode);

    const userData = await insertOrUpdateMicrosoftUser(userName, userEmail, userPicture, undefined, undefined, id);

    const microsoftPayload = {
      username: userData.username,
      email: userData.email,
      picture: userData.picture,
      matricula: userData.matricula,
      rol: userData.usergroup,
    };

    const accessToken = generateAccessToken(microsoftPayload);
    const refreshToken = generateRefreshToken(microsoftPayload);

    res.status(200).json({
      accessToken,
      refreshToken,
      user: microsoftPayload,
    });
  } catch (err) {
    console.error("Error en loginWithMicrosoft:", err);
    res.status(err.status || 500).send(err.message || "Internal Server Error");
  }
};

// Funcion encargada de cerrar la sesión del usuario autenticado.
// Envia un token vacío al cliente para que se desconecte.
// EXPERIMENTAL, EN DESARROLLO
export const logout = (req, res) => {
  res.json({ token: "" });
};
