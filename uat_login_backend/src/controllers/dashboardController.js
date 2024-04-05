import { getUserUATsByEmail } from "../../utils/db.js";

// ESTE CONTROLADOR PASA POR EL MIDDLEWARE PARA VERIFICAR AL USUARIO
// ACTUALMENTE EN DESARROLLO, MOSTRARA CARACTERISTICAS MAS AVANZADAS O ESTADISTICAS DEL USUARIO
// USARA CONTROLADORES ENCARGADOS DE MANEJAR LOS DATOS DEL CLIENTE (POSIBLEMENTE EN OTROS LENGUAJES COMO PYTHON)
export const getDashboard = async (req, res) => {
  console.debug("Datos decodificados desde Middleware: ", req.user);
  const username = req.user.username;
  const userPicture = req.user.picture;
  const userEmail = req.user.email;
  const userMatricula = req.user.matricula;
};
