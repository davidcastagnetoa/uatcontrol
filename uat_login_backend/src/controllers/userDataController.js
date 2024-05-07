import { searchUserByEmail } from "../services/userService.js";
import { insertUatCollection, getAllUserUATsByEmail, deleteUserUATById } from "../services/uatService.js";

/**
 * ESTE CONTROLADOR PASA POR EL MIDDLEWARE PARA
 * VERIFICAR AL USUARIO YA QUE ES UNA RUTA PROTEGIDA
 * ESTE CONTROLADOR DEVUELVE LOS DATOS DEL USUARIO
 */

//  * Controlador para obtener todas las UAT de un usuario de la DB.
export const getAllUserUATs = async (req, res) => {
  const { username, picture: userPicture, email: userEmail, matricula: userMatricula } = req.user;

  try {
    console.debug("Cargando UATs para el usuario:", userEmail);
    let uatRows = await getAllUserUATsByEmail(userEmail);

    let payload = {
      message: `Welcome back, ${username}`,
      userData: {
        username,
        matricula: userMatricula,
        picture: userPicture,
        email: userEmail,
      },
      userUAT: uatRows.length > 0 ? uatRows : [],
    };

    console.debug(uatRows.length > 0 ? `${uatRows.length} UATs encontradas` : "UATs no encontradas");
    res.json(payload);
  } catch (err) {
    console.error("Error al obtener las UATs del usuario:", err);
    res.status(500).send("Internal Server Error");
  }
};

//  * Controlador para obtener datos de perfil del usuario
export const getUserProfile = async (req, res) => {
  console.log("\nObteniendo datos del Usuario...");
  const userEmail = req.user.email;

  try {
    const userData = await searchUserByEmail(userEmail);
    if (!userData) {
      console.error("Usuario no encontrado para el email:", userEmail);
      return res.status(404).send("Usuario no encontrado");
    }

    const payload = {
      username: userData.username,
      matricula: userData.matricula,
      picture: userData.picture,
      email: userData.email,
      privilegio: userData.usergroup,
    };

    console.log("Datos de usuario cargados correctamente");
    res.json(payload);
  } catch (err) {
    console.error("Error al obtener los datos del usuario:", err.message);
    switch (err.message) {
      case "Usuario no encontrado":
        return res.status(404).send("Usuario no encontrado");
      default:
        return res.status(500).send("Internal Server Error");
    }
  }
};

//  * Controlador para eliminar una UAT del usuario en la DB.
export const removeUserUAT = async (req, res) => {
  console.log("\n..:: Eliminando UAT ::..");
  const { uatScript, uatLink, uatOSA } = req.body;

  if (!uatScript || !uatLink || !uatOSA) {
    return res.status(400).send("Error, faltan datos de la UAT a borrar");
  }

  const userEmail = req.user.email;
  console.debug("removeUserUAT, Email encontrado: ", userEmail);

  try {
    const user = await searchUserByEmail(userEmail);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    const result = await deleteUserUATById(user.id, uatScript, uatLink, uatOSA);

    if (result === 0) {
      console.debug("No se encontró la UAT con los parámetros dados.");
      return res.status(404).send("UAT no encontrada");
    }

    console.debug("UAT eliminada correctamente.", result);
    return res.status(200).send("UAT eliminada correctamente");
  } catch (err) {
    console.error("Error al eliminar la UAT:", err.message);
    return res.status(500).send("Error al eliminar la UAT");
  }
};

//  * Controlador para guardar una UAT de un usuario en la DB.
export const saveUserUAT = async (req, res) => {
  const { uatLink, uatScript, uatOSA, uatStatus } = req.body;

  // Nombre de usuario
  const userEmail = req.user.email; // El email viene en el payload del token
  console.debug("Email encontrado: ", userEmail);

  try {
    console.debug("Controlador saveUserUAT: Buscando usuario por email");
    const user = await searchUserByEmail(userEmail);

    if (!user) {
      console.error("Usuario no encontrado");
      return res.status(404).send("Usuario no encontrado");
    }

    console.debug("Controlador saveUserUAT: Guardando UAT");
    const UATinserted = await insertUatCollection(user.id, uatScript, uatLink, uatOSA, uatStatus);
    console.debug("UAT guardada con ID:", UATinserted);
    return res.status(200).send("UAT guardada correctamente");
  } catch (err) {
    console.error("Error en el controlador saveUserUAT:", err.message);
    return res.status(500).send("Error interno del servidor");
  }
};

//! EN DESARROLLO
// * Controlador para actualizar datos de perfil del usuario
export const updateUserProfile = async (req, res) => {
  // Pasa por el middleware para identificar al usuario
  console.debug("Datos decodificados desde Middleware: ", req.user);
  // Se lo enviamos desde el cliente, parametros a obtener
  const { username, matricula, email, password } = req.body; // password esta en auth_methods, auth_details
  // Obtenemos contraseña del cliente
  // Encriptamos la contraseña elegida por el cliente
  // Se guarda dicha contraseña en la DB
  // Se responde con un response.ok
  return res.status(500).send("Endpoint aun no disponible");
};
