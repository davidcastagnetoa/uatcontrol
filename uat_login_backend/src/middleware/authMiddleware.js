import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("Error al validar el token: ", err);
      return res.sendStatus(403);
    }
    req.user = decoded; // Agregar el usuario decodificado a la solicitud
    console.debug("Datos decodificados del middleware: ", decoded); // Imprimir el usuario decodificado para verificar que funcione correctamente
    next();
  });
};
