import { verifyToken } from "../services/authService.js";

export const verifyUserToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  try {
    const decoded = await verifyToken(token);
    // Agregar el usuario decodificado a la solicitud
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Error al validar el token: ", err);
    return res.sendStatus(403);
  }
};
