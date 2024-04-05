import { searchUserByUsername, insertUatCollection, getUserUATsByEmail } from "../../utils/db.js";

// ESTE CONTROLADOR PASA POR EL MIDDLEWARE PARA VERIFICAR AL USUARIO
// YA QUE ES UNA RUTA PROTEGIDA
// ESTE CONTROLADOR DEVUELVE LOS DATOS DEL USUARIO

// Controlador para guardar las UAT de un usuario en la DB
export const saveUserUAT = async (req, res) => {
  const { uatLink, uatScript, uatOSA, uatStatus } = req.body;
  console.debug("Datos recibidos en body:", req.body); // Se lo enviamos desde el cliente, parametros a guardar
  console.debug("Datos recibidos del usuario:", req.user); // Pasa por el middleware para obtener los datos del usuario

  // Nombre de usuario
  const username = req.user.username;
  console.debug("Username encontrado: ", username);

  // Ruta de imagen de usuario
  const userPicture = req.user.picture;
  console.debug("Imagen de Perfil: ", userPicture);

  // Email de usuario
  const userEmail = req.user.email;
  console.debug("Email encontrado: ", userEmail);

  // Matricula del usuario
  const userMatricula = req.user.matricula;
  console.debug("Imagen de Perfil: ", userMatricula);

  let row;

  // Primero, intenta obtener el user_id del usuario existente, mediante su username
  try {
    console.debug("\n...:: Ejecutando try principal de busqueda de usuario::...");
    row = await searchUserByUsername(username);
    console.log(`Se ha obtenido correctamente el ID del usuario ${username}: datos: ${JSON.stringify(row)}`);
  } catch (err) {
    console.error("Error al buscar el usuario:", err.message);
    return res.status(500).send("Error al buscar el usuario, este usuario no esta autorizado");
  }

  try {
    console.debug("\n...:: Ejecutando siguiente try, guardado de UAT::...");
    let userId;
    if (!row) {
      throw new Error("El usuario no existe, no se puede guardar la UAT");

      // // NO DISPONIBLE, Experimental
      // console.debug("\n...:: Ejecutando siguiente try, insertando nuevo usuario::...");
      // console.debug("El usuario no existe, insertando usuario...");
      // const userId = await insertUser(uatUsername, userEmail, userPicture, userMatricula);
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
      return res.status(200).send("Enlace UAT guardado correctamente");
    }
  } catch (err) {
    console.error("Error al guardar la UAT:", err.message);
    return res.status(500).send("Error al guardar la UAT");
  }
};

// Controlador para obtener todas las UAT de un usuario de la DB
export const getUserUATs = async (req, res) => {
  console.debug("Datos decodificados desde Middleware: ", req.user); // Pasa por el middleware para obtener los datos del usuario
  const username = req.user.username;
  const userPicture = req.user.picture;
  const userEmail = req.user.email;
  const userMatricula = req.user.matricula;

  //Aqui llamamos las UAT de las bases de datos del usuario para mostrarlas en la dashboard
  try {
    console.debug("\n...:: Ejecutando siguiente try ::...");

    // Buscamos las UATs del usuario en la base de datos por email del usuario
    let uatRows = await getUserUATsByEmail(userEmail);

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

// EN DESARROLLO :
// Controlador para obtener datos de perfil del usuario
export const getUserProfile = async (req, res) => {
  // Pasa por el middleware para identificar al usuario
  console.debug("Datos decodificados desde Middleware: ", req.user);
  // Buscamos al cliente con el email encontrado en el middleware
  // Buscamos el id del usuario  en la BD a partir del email
  // Si no existe el usuario, devuelve un error
  //  Si existe, continua y busca el resto de datos personales no codificados en el middleware
};

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

// Eliminar una UAT del usuario de la DB
export const removeUserUAT = async (req, res) => {
  // Pasa por el middleware para identificar al usuario
  console.debug("Datos decodificados desde Middleware: ", req.user);
  // Se lo enviamos desde el cliente, parametros a obtener
  const { uatLink, uatScript, uatOSA } = req.body; // Se usaran los 3 valores
  // Se obtiene el id de la UAT que coincida con los 3 valores, link, script, osa
  // Se busca dicha id en la DB y se elimina
  // Si la busqueda es fallida devuelve un error que el cliente tratará como tal
  // Se responde con un response.ok
};
