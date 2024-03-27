// authController.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Esta funcion recibe el usuario y contraseña del la funcion login del cliente,
// en AuthProvider.js, y si son correctos genera y devuelve un token.
// Si no son correctos devuelve un 401.
export const login = async (req, res) => {
  const { username, password } = req.body;

  // Aquí verificarías contra una base de datos,
  // para este ejemplo compararemos con las variables de entorno
  if (username === process.env.USER_NAME && password === process.env.USER_PASSWORD) {
    // Generar un token
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "1h" });
    // console.log("\nToken generado:", token);
    res.json({ token });
  } else {
    // Credenciales no válidas
    res.status(401).json({ message: "Credenciales no válidas" });
  }
};

// Esta funcion verifica el token recibido por el cliente desde
// AuthProvider.js en el header de la peticion,
// y si es valido devuelve el usuario y el token.
// Si no es valido devuelve un 401.
export const verifyTokenController = (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    // console.log("Header recibido: ", authHeader);
    const token = authHeader && authHeader.split(" ")[1];

    // console.debug("TOKEN recibido en verifyTokenController: ", token);
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      console.debug("Datos de usuario encontrados en verifyTokenController: ", user);
      res.json({ valid: true, username: user.username, email: user.email, picture: user.picture, token: token });
    });
  } catch (err) {
    console.log("Error en verifyTokenController: ", err);
    return res.sendStatus(500);
  }
};
