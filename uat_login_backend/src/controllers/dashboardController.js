import { getUserUATsStatusCountsByEmail } from "../../utils/db.js";

// ESTE CONTROLADOR PASA POR EL MIDDLEWARE PARA VERIFICAR AL USUARIO
// ACTUALMENTE EN DESARROLLO, MOSTRARA CARACTERISTICAS MAS AVANZADAS O ESTADISTICAS DEL USUARIO
// USARA CONTROLADORES ENCARGADOS DE MANEJAR LOS DATOS DEL CLIENTE (POSIBLEMENTE EN OTROS LENGUAJES COMO PYTHON)

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
