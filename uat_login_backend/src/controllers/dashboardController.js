import { getUserUATsStatusCountsByEmail, getAllUserByAdmin } from "../../utils/db.js";

// ESTE CONTROLADOR PASA POR EL MIDDLEWARE PARA VERIFICAR AL USUARIO
// ACTUALMENTE EN DESARROLLO, MOSTRARA CARACTERISTICAS MAS AVANZADAS O ESTADISTICAS DEL USUARIO
// USARA CONTROLADORES ENCARGADOS DE MANEJAR LOS DATOS DEL CLIENTE (POSIBLEMENTE EN OTROS LENGUAJES COMO PYTHON)

// Controlador para obtener las estadisticas de las UATs del usuario en la DB
export const getUATsStatistics = async (req, res) => {
  console.debug("Datos decodificados desde Middleware: ", req.user);
  const userEmail = req.user.email;

  try {
    const counts = await getUserUATsStatusCountsByEmail(userEmail);
    const total = counts.reduce((acc, curr) => acc + curr.count, 0);

    const stats = counts.map((status) => ({
      ...status,
      percentage: parseFloat(((status.count / total) * 100).toFixed(2)),
    }));

    res.json({
      message: "Estadísticas de estados de UATs",
      data: stats,
    });
  } catch (error) {
    console.error("Error al obtener estadísticas de UATs:", error);
    res.status(500).send("Error interno del servidor");
  }
};

// Controlador para obtener todos los usuarios de la DB, solo disponible para usuarios con privilegios de administrador
export const getAllUsers = async (req, res) => {
  // Pasa por el middleware para identificar al usuario
  console.debug("Datos decodificados desde Middleware: ", req.user);

  // Email de usuario enviado desde el cliente
  const userEmail = req.user.email;
  console.debug("getAllUsers, Email encontrado: ", userEmail);

  try {
    console.debug(
      "\nControlador getAllUsers: Verificando si el usuario es administrador y obteniendo usuarios"
    );

    // Intenta obtener todos los usuarios con la función que verifica si es administrador
    let userRows = await getAllUserByAdmin(userEmail);

    // Preparamos el objeto de respuesta con los datos del usuario
    let responseData = {
      userRows: userRows, // Aquí insertamos el arreglo de UATs directamente
    };

    // Verificamos si se encontraron los Usuarios
    if (userRows.length > 0) {
      console.debug(`Usuarios Encontrados: ${JSON.stringify(userRows)}`);
    } else {
      console.debug("Usuarios No Encontrados");
      responseData.userRows = []; // Si no se encontraron UATs, asignamos un arreglo vacío
    }

    // Enviamos la respuesta
    res.json(responseData);
  } catch (error) {
    console.error("Error al obtener Todos los usuarios:", error.message);

    // Podemos utilizar el mensaje del error para decidir qué código de estado HTTP enviar
    if (error.message.includes("Acceso denegado")) {
      res.status(403).send("Acceso denegado. No tienes privilegios de administrador.");
    } else {
      res.status(500).send("Error interno del servidor");
    }
  }
};
