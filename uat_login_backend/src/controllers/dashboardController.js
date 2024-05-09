import { getUserUATsStatusCountsByEmail, getAllUserByAdmin } from "../services/uatService.js";

/**
//  -  ESTE CONTROLADOR PASA POR EL MIDDLEWARE PARA VERIFICAR AL USUARIO
//  -  ACTUALMENTE EN DESARROLLO, MOSTRARA CARACTERISTICAS MAS AVANZADAS
//  -  Y/O ESTADISTICAS DEL USUARIO. USARA CONTROLADORES ENCARGADOS DE MANEJAR
//  -  LOS DATOS DEL CLIENTE (POSIBLEMENTE EN OTROS LENGUAJES COMO PYTHON)
 */

// * Controlador para obtener las estadisticas de las UATs del usuario en la DB
export const getUATsStatistics = async (req, res) => {
  const userEmail = req.user.email;

  try {
    const result = await getUserUATsStatusCountsByEmail(userEmail);
    res.json(result);
  } catch (error) {
    console.error("Error al obtener estadísticas de UATs:", error);
    res.status(500).send("Error interno del servidor");
  }
};

// * Controlador para obtener todos los usuarios de la DB, sólo disponible para administradores
export const getAllUsers = async (req, res) => {
  const userEmail = req.user.email;

  try {
    const userRows = await getAllUserByAdmin(userEmail);
    console.debug(`Usuarios Encontrados: ${userRows.length}`);

    const responseData = {
      userRows: userRows.length > 0 ? userRows : [],
    };

    res.json(responseData);
  } catch (error) {
    console.error("Error al obtener todos los usuarios:", error.message);

    if (error.message.includes("Acceso denegado")) {
      res.status(403).send(error.message);
    } else {
      res.status(500).send("Error interno del servidor");
    }
  }
};
