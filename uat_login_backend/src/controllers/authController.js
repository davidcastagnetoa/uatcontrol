// authController.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
// import { db } from "../../utils/db.js";

dotenv.config();

// Esta funcion recibe el usuario y contraseña del la funcion login del cliente,
// en AuthProvider.js, y si son correctos genera y devuelve un token.
// Si no son correctos devuelve un 401.
export const login = async (req, res) => {
  const { username, password } = req.body; //Lo que enviamos desde el cliente

  // // Verificar el usuario en la base de datos junto con su método de autenticación local
  // db.get(
  //   `SELECT users.username, users.email, users.picture, auth_methods.auth_details
  // FROM users
  // JOIN auth_methods ON users.id = auth_methods.user_id
  // WHERE users.username = ? AND auth_methods.auth_type = 'local'`,
  //   [username],
  //   (err, row) => {
  //     if (err) {
  //       // Manejar errores de la base de datos
  //       return res.status(500).json({ message: "Error al consultar la base de datos" });
  //     }

  //     if (!row) {
  //       // Usuario no encontrado o no tiene autenticación local
  //       return res.status(401).json({ message: "Credenciales no válidas" });
  //     }

  //     // En este punto, `row.auth_details` contiene el hash de la contraseña
  //     // Suponiendo que usas bcrypt para hashear y verificar las contraseñas
  //     const isPasswordCorrect = bcrypt.compareSync(password, row.auth_details);

  //     if (isPasswordCorrect) {
  //       // Generar un token
  //       const token = jwt.sign(
  //         { username: row.username, email: row.email, picture: row.picture },
  //         process.env.JWT_SECRET,
  //         { expiresIn: "1h" }
  //       );

  //       // Enviar la respuesta
  //       res.json({
  //         token,
  //         userData: {
  //           username: row.username,
  //           email: row.email,
  //           picture: row.picture,
  //         },
  //       });
  //     } else {
  //       // Contraseña incorrecta
  //       res.status(401).json({ message: "Credenciales no válidas" });
  //     }
  //   }
  // );

  // EJEMPLO DE VARIABLES DE ENTORNO
  // Datos falsos
  const email = "usuario@email.com";
  const picture = "default_avatar_route.png";

  if (username === process.env.USER_NAME && password === process.env.USER_PASSWORD) {
    // Generar un token
    // const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "1h" });
    const token = jwt.sign({ username, password, email, picture }, process.env.JWT_SECRET, { expiresIn: "1h" });
    // console.debug("\nToken generado:", token);
    res.json({
      token,
      userData: {
        username: username,
        email: email,
        picture: picture,
      },
    });
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
    // console.debug("Header recibido: ", authHeader);
    const token = authHeader && authHeader.split(" ")[1];

    // console.debug("TOKEN recibido en verifyTokenController: ", token);
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      console.debug("Datos de usuario encontrados en verifyTokenController: ", user);
      const username = user.username || user.name;
      res.json({ valid: true, username: username, email: user.email, picture: user.picture, token: token });
    });
  } catch (err) {
    console.log("Error en verifyTokenController: ", err);
    return res.sendStatus(500);
  }
};
