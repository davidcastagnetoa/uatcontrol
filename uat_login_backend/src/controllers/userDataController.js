import { removeUserTarget, searchUserByEmail, updateUserProfile } from "../services/userService.js";
import {
  insertUatCollection,
  getAllUserUATsByEmail,
  deleteUserUATById,
  getUATUrlByEmailAndId,
  getUATById,
  isAdmin,
} from "../services/uatService.js";

import { CookieJar } from "tough-cookie";
import fetchCookie from "fetch-cookie";

/**
// - ESTE CONTROLADOR PASA POR EL MIDDLEWARE PARA
// - VERIFICAR AL USUARIO YA QUE ES UNA RUTA PROTEGIDA
// - ESTE CONTROLADOR DEVUELVE LOS DATOS DEL USUARIO
// - Y LOS DATOS DEL USUARIO QUE SE PASO POR PARAMETRO
// - EN LA URL.
 // ! LOS DATOS req.user SE OBTIENEN DEL TOKEN 
 // ! DECODIFICADO POR EL MIDDLEWARE
 */

// * Controlador para eliminar a un usuario de la DB
export const deleteUser = async (req, res) => {
  const { emailUserTarget } = req.body;
  const { email } = req.user; // El email se obtiene del token decodificado por el middleware

  try {
    const userRequester = await searchUserByEmail(email);
    if (userRequester.usergroup !== "administrador") {
      return res.status(403).json({ message: "¡Denegado!, no estás autorizado a eliminar usuarios" });
    }

    const userTarget = await searchUserByEmail(emailUserTarget);
    if (!userTarget) {
      return res.status(404).json({ message: "Usuario a eliminar no encontrado" });
    }

    if (userRequester.id === userTarget.id) {
      console.log("No puedes eliminarte a ti mismo");
      return res.status(400).json({ message: "No puedes eliminarte a ti mismo" });
    }

    const removedUserTarget = await removeUserTarget(emailUserTarget);
    if (!removedUserTarget) {
      return res.status(400).json({ message: "No se pudo eliminar al usuario" });
    }

    res.json({
      message: "Usuario eliminado correctamente",
      userData: {
        username: removedUserTarget.username,
        email: removedUserTarget.email,
        matricula: removedUserTarget.matricula,
      },
    });
  } catch (error) {
    console.error("Error al eliminar al usuario:", error.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

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
  // console.log("\nObteniendo datos del Usuario...");
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

    // console.log("Datos de usuario cargados correctamente");
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

// - Controlador para obtener la url de la UAT y redirigir al cliente a esta URL (EN DESARROLLO)
export const proxyUAT = async (req, res) => {
  const { uatId } = req.query;
  const userEmail = req.user.email;

  if (!uatId) {
    return res.status(400).send("Error, se requiere el ID de la UAT");
  }
  if (!userEmail) {
    return res.status(400).send("Error, se requiere el email del usuario");
  }

  try {
    console.log("\nComprobando UAT...");
    const uat = await getUATById(uatId);

    if (!uat) {
      return res.status(404).send("UAT no encontrada");
    }

    try {
      // * Verifica si el usuario es administrador
      await isAdmin(userEmail);
      console.log(`Administrador ${userEmail} identificado. Accediendo a recurso`);
      console.log("Redirigiendo a enlace protegido:", uat.link);

      const link = uat.link;
      console.log("Enlace protegido:", link);

      const cookieJar = new CookieJar();
      const fetchWithCookies = fetchCookie(fetch, cookieJar);

      // Realizar la autenticación y obtener las cookies
      const linkAccess = "http://gus.gtm.securitasdirect.local:3002/auth/signin";
      const payload = JSON.stringify({
        username: "DI4697",
        password: "Castagneto.DI4697",
      });

      try {
        const loginResponse = await fetchWithCookies(linkAccess, {
          method: "POST",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            Connection: "keep-alive",
          },
          body: payload,
        });

        if (!loginResponse.ok) {
          throw new Error("Error en la autenticación");
        }

        // - Guardar las cookies en la sesión del usuario
        req.cookies = cookieJar.getCookiesSync(linkAccess);
        var gatheredCookies = req.cookies;
        console.log("Cookies obtenidas:", gatheredCookies);
      } catch (err) {
        console.error("Error en la autenticación:", err);
        res.status(500).send("Error en la autenticación");
      }

      //! Segunda petición, para acceder a recursos del servidor
      fetch(link, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Connection: "keep-alive",
          Cookie: gatheredCookies,
        },
      })
        .then((uatResponse) => {
          // console.log("\n\n ::::: Respuesta de la UAT:", uatResponse);
          res.cookie(gatheredCookies);
          res.json({ url: link });
        })
        .catch((err) => {
          console.error("Error al obtener la UAT:", err);
          res.status(500).send("Internal Server Error");
        });

      // res.redirect(uat.link);
    } catch (adminError) {
      // * Si no es administrador, verifica si tiene acceso a la UAT
      const uatUrl = await getUATUrlByEmailAndId(userEmail, uatId);
      if (!uatUrl) {
        console.error(`Error, el usuario ${userEmail} no tiene acceso a esta UAT`);
        return res.status(403).send("No tienes acceso a esta UAT");
      }
      //! Redireccionar al cliente a la URL obtenida
      console.log("Redirigiendo a enlace protegido:", uatUrl);

      const { link } = uatUrl;
      fetch(link, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Connection: "keep-alive",
          Cookie: gatheredCookies,
        },
      })
        .then((uatResponse) => {
          // console.log("\n\n ::::: Respuesta de la UAT:", uatResponse);
          res.cookie(gatheredCookies);
          res.json({ url: link });
        })
        .catch((err) => {
          console.error("Error al obtener la UAT:", err);
          res.status(500).send("Internal Server Error");
        });

      // res.redirect(uatUrl);
    }
  } catch (err) {
    console.error("Error al redireccionar a la UAT:", err);
    res.status(500).send("Internal Server Error");
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

// * Controlador para actualizar datos de perfil del usuario
export const updateUserProfileController = async (req, res) => {
  const { username, matricula, privilegio } = req.body;
  const { email } = req.user; // El email se obtiene del token decodificado por el middleware

  try {
    // Verifica si el usuario existe
    const user = await searchUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Actualiza el perfil del usuario
    const updated = await updateUserProfile(email, { username, matricula, privilegio });
    if (!updated) {
      return res.status(400).json({ message: "No se pudo actualizar el perfil del usuario" });
    }

    // Obtén los datos actualizados del usuario
    const updatedUser = await searchUserByEmail(email);

    res.json({
      message: "Perfil del usuario actualizado correctamente",
      userData: {
        username: updatedUser.username,
        email: updatedUser.email,
        matricula: updatedUser.matricula,
        picture: updatedUser.picture,
        privilegio: updatedUser.usergroup,
      },
    });
  } catch (error) {
    if (error.message.includes("El nombre de usuario ya está en uso")) {
      console.error("El nombre de usuario ya está en uso:", error.message);
      return res.status(409).json({ message: "El nombre de usuario ya está en uso" });
    }

    console.error("Error al actualizar el perfil del usuario:", error.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
