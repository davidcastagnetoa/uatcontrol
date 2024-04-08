import {
  searchUserByUsername,
  searchUserByEmail,
  insertUatCollection,
  getAllUserUATsByEmail,
  deleteUserUATById,
} from "../../utils/db.js";

// ESTE CONTROLADOR PASA POR EL MIDDLEWARE PARA VERIFICAR AL USUARIO
// YA QUE ES UNA RUTA PROTEGIDA
// ESTE CONTROLADOR DEVUELVE LOS DATOS DEL USUARIO

// Controlador para guardar una UAT de un usuario en la DB
export const saveUserUAT = async (req, res) => {
  const { uatLink, uatScript, uatOSA, uatStatus } = req.body;
  console.debug("Datos recibidos en body:", req.body); // Se lo enviamos desde el cliente, parametros a guardar
  console.debug("Datos recibidos del usuario:", req.user); // Pasa por el middleware para obtener los datos del usuario

  // Nombre de usuario
  const username = req.user.username;
  console.debug("Username encontrado: ", username);

  let row;

  // Primero, intenta obtener el user_id del usuario existente, mediante su username
  try {
    console.debug("\nControlador saveUserUAT: Ejecutando try principal de busqueda de usuario");
    row = await searchUserByUsername(username);
    console.log(`Se ha obtenido correctamente el ID del usuario ${username}: datos: ${JSON.stringify(row)}`);
  } catch (err) {
    console.error("Error al buscar el usuario:", err.message);
    return res.status(500).send("Error al buscar el usuario, este usuario no esta autorizado");
  }

  try {
    console.debug("\nControlador saveUserUAT: Ejecutando siguiente try, guardado de UAT");
    let userId;
    if (!row) {
      throw new Error("El usuario no existe, no se puede guardar la UAT");

      // // NO DISPONIBLE, Experimental, si el usuario no existe se crea uno nuevo
      // console.debug("\nControlador saveUserUAT: Ejecutando siguiente try, insertando nuevo usuario");
      // console.debug("El usuario no existe, insertando usuario...");
      // const userId = await insertUser(uatUsername, userEmail, userPicture, userMatricula, userRoll);
      // console.debug("Nuevo usuario insertado, userId:", userId);
      // console.log("Insertando UAT...");
      // const UATinserted = await insertUatCollection(userId, uatScript, uatLink, uatOSA, uatStatus);
      // console.debug("UAT insertado:", UATinserted);
      // return res.status(200).send("Enlace UAT guardado correctamente");
    } else {
      // El usuario existe, usa su id existente
      userId = row.id;
      const UATinserted = await insertUatCollection(userId, uatScript, uatLink, uatOSA, uatStatus);
      console.debug("UAT insertado:", UATinserted);
      return res.status(200).send("UAT guardada correctamente");
    }
  } catch (err) {
    console.error("Error al guardar la UAT:", err.message);
    return res.status(500).send("Error al guardar la UAT");
  }
};

// Controlador para obtener todas las UAT de un usuario de la DB
export const getAllUserUATs = async (req, res) => {
  console.debug("Datos decodificados desde Middleware: ", req.user); // Pasa por el middleware para obtener los datos del usuario
  const username = req.user.username;
  const userPicture = req.user.picture;
  const userEmail = req.user.email;
  const userMatricula = req.user.matricula;

  //Aqui llamamos las UAT de las bases de datos del usuario para mostrarlas en la dashboard
  try {
    console.debug("\nControlador getAllUserUATs: Ejecutando try principal");

    // Buscamos las UATs del usuario en la base de datos por email del usuario
    let uatRows = await getAllUserUATsByEmail(userEmail);

    // Preparamos el objeto de respuesta con los datos del usuario
    let responseData = {
      message: `Welcome back, ${username}`,
      userData: {
        username: username,
        matricula: userMatricula,
        picture: userPicture,
        email: userEmail,
      },
      userUAT: uatRows, // Aquí insertamos el arreglo de UATs directamente
    };

    // Verificamos si se encontraron las UATs
    if (uatRows.length > 0) {
      console.debug(`UATs Encontradas: ${JSON.stringify(uatRows)}`);
    } else {
      console.debug("UATs no encontradas");
      responseData.userUAT = []; // Si no se encontraron UATs, asignamos un arreglo vacío
    }

    // Enviamos la respuesta
    res.json(responseData);
  } catch (err) {
    console.error("Error al obtener las UATs del usuario: ", err);
    return res.status(500).send("Internal Server Error");
  }
};

// Controlador para eliminar una UAT del usuario en la DB
export const removeUserUAT = async (req, res) => {
  console.log("..:: Eliminando UAT ::..");
  // DATOS A USAR
  // Se pasa por el middleware para identificar al usuario logado
  console.debug("Datos decodificados desde Middleware: ", req.user);

  // Parametros a tratar enviados desde el cliente
  const { uatScript, uatLink, uatOSA } = req.body; // Se usaran los 3 valores que recibimos desde el cliente

  if (!uatScript || !uatLink || !uatOSA) {
    return res.status(400).send("Error, faltan datos de la UAT a borrar");
  }

  // Email de usuario
  const userEmail = req.user.email;
  console.debug("Email encontrado: ", userEmail);

  let row;

  // Primero, intenta obtener el user_id del usuario existente, mediante su email
  try {
    console.debug("\nControlador removeUserUAT: Ejecutando try principal de busqueda de usuario");
    row = await searchUserByEmail(userEmail);
    console.log(`Se ha obtenido correctamente el ID del usuario ${userEmail}: datos: ${JSON.stringify(row)}`);
  } catch (err) {
    console.error("Error al buscar el usuario:", err.message);
    return res.status(500).send("Error al buscar el usuario, este usuario no esta autorizado");
  }

  // Segundo. Se obtiene el id de la UAT que coincida con los valores link, script, osa y que este asociada a dicho usuario
  try {
    console.debug("\nControlador removeUserUAT: Ejecutando siguiente try, eliminando UAT");
    let userId;

    // Si el usuario no existe, devuelve un error
    if (!row) {
      throw new Error("El usuario no existe, no se puede eliminar una UAT de un usuario no valido");
    }

    // El usuario existe, usa su id existente para encontrar la UAT
    userId = row.id;

    // Borra la UAT asociada al usuario
    const UATremoved = await deleteUserUATById(userId, uatScript, uatLink, uatOSA);
    console.debug("UAT eliminada:", UATremoved);
    return res.status(200).send("UAT eliminada correctamente");
  } catch (err) {
    // Si no se encuentra dicha UAT, se devuelve un error
    console.error("Error al eliminar la UAT:", err.message);
    return res.status(500).send("Error al eliminar la UAT");
  }
};

// Controlador para obtener datos de perfil del usuario
export const getUserProfile = async (req, res) => {
  console.log("..:: Obteniendo datos del Usuario ::..");
  // DATOS A USAR
  // Pasa por el middleware para identificar al usuario
  console.debug("Datos decodificados desde Middleware: ", req.user);

  // Email de usuario
  const userEmail = req.user.email;
  console.debug("Email encontrado: ", userEmail);

  let row;

  // Primero, intenta obtener el user_id del usuario existente, mediante su email
  try {
    console.debug("\nControlador getUserProfile: Ejecutando try principal de busqueda de usuario");
    row = await searchUserByEmail(userEmail);
    console.log(`Se ha obtenido correctamente el ID del usuario ${userEmail}: datos: ${JSON.stringify(row)}`);
  } catch (err) {
    console.error("Error al buscar el usuario:", err.message);
    return res.status(500).send("Error al buscar el usuario, este usuario no esta autorizado");
  }

  try {
    console.debug("\nControlador getUserProfile: Ejecutando siguiente try, enviando datos de usuario");

    // Si el usuario no existe, devuelve un error
    if (!row) {
      throw new Error("El usuario no existe, no se puede obtener los datos de un usuario inexistente");
    }

    // El usuario existe, usa su id existente para encontrar la UAT
    const userName = row.username;
    const userPicture = row.picture;
    const userMatricula = row.matricula;
    const userRoll = row.usergroup;

    let userData = {
      username: userName,
      matricula: userMatricula,
      picture: userPicture,
      email: userEmail,
      privilegio: userRoll,
    };

    // Enviamos la respuesta
    res.json(userData);
  } catch (err) {
    console.error("Error al obtener los datos del usuario: ", err);
    return res.status(500).send("Internal Server Error");
  }
};

// EN DESARROLLO :

// Controlador para actualizar datos de perfil del usuario
export const updateUserProfile = async (req, res) => {
  // Pasa por el middleware para identificar al usuario
  console.debug("Datos decodificados desde Middleware: ", req.user);
  // Se lo enviamos desde el cliente, parametros a obtener
  const { username, matricula, email, password } = req.body; // password esta en auth_methods, auth_details
  // Obtenemos contraseña del cliente
  // Encriptamos la contraseña elegida por el cliente
  // Se guarda dicha contraseña en la DB
  // Se responde con un response.ok
};
