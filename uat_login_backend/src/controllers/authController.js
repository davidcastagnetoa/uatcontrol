// authController.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { db, searchUserByEmail, insertUser } from "../../utils/db.js";
import { Client } from "@microsoft/microsoft-graph-client";
import { OAuth2Client } from "google-auth-library";

dotenv.config();

// Constantes requeridas
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, "postmessage"); //Verificar que es "postmessage "

// Control de credenciales y errores para debug
if (!CLIENT_ID) {
  console.error("Google client ID environment variable not set. Please add GOOGLE_CLIENT_ID to .env file.");
  throw new Error("Google client ID environment variable not set");
}
if (!CLIENT_SECRET) {
  console.error("Google Secret environment variable not set. Please add GOOGLE_CLIENT_SECRET to .env file.");
  throw new Error("Google Secret environment variable not set");
}
if (!oAuth2Client) {
  console.error("OAuth2Client not defined");
  throw new Error("OAuth2Client not defined");
}

// Esta funcion recibe el usuario y contraseña del la funcion login del cliente,
// en AuthProvider.js, y si son correctos genera y devuelve un token.
// Si no son correctos devuelve un 401.
export const login = async (req, res) => {
  const { username, password } = req.body; //Lo que enviamos desde el cliente

  // Verificar si la contraseña está presente
  if (!password) {
    return res.status(400).json({ message: "La contraseña es requerida" });
  }
  // Verificar si username está presente
  if (!username) {
    return res.status(400).json({ message: "El nombre de usuario es requerido" });
  }

  // Verificar el usuario en la base de datos junto con su método de autenticación local
  db.get(
    `SELECT users.username, users.email, users.picture, users.matricula, auth_methods.auth_details
  FROM users
  JOIN auth_methods ON users.id = auth_methods.user_id
  WHERE users.username = ? AND auth_methods.auth_type = 'local'`,
    [username],
    (err, row) => {
      if (err) {
        // Manejar errores de la base de datos
        console.debug("Error al consultar la base de datos");
        return res.status(500).json({ message: "Error al consultar la base de datos" });
      }

      if (!row) {
        // Usuario no encontrado o no tiene autenticación local
        console.debug("Usuario no encontrado o no tiene autenticación local");
        return res.status(401).json({ message: "Usuario no encontrado o no tiene autenticación local" });
      }

      // `row.auth_details` contiene el hash de la contraseña
      // Usar bcrypt para hashear y verificar las contraseñas
      const isPasswordCorrect = bcrypt.compareSync(password, row.auth_details);

      if (isPasswordCorrect) {
        // Generar un token
        const token = jwt.sign(
          { username: row.username, email: row.email, picture: row.picture, matricula: row.matricula },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        // Enviar la respuesta
        console.debug("\nUsername encontrado:", row.username);
        console.debug("Email encontrado:", row.email);
        console.debug("Imagen de perfil encontrada:", row.picture);
        console.debug("Matricula Encontrada:", row.matricula);

        res.json({
          token,
          userData: {
            username: row.username,
            email: row.email,
            picture: row.picture,
            matricula: row.matricula,
          },
        });
      } else {
        // Contraseña incorrecta
        console.debug("Credenciales no validas");
        res.status(401).json({ message: "Credenciales no válidas" });
      }
    }
  );
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

// Esta funcion da da alta a un usuario y registra sus datos en la base de datos
// Si el usuario ya esta registrado devuelve un 409.
// Si no se pudo dar alta devuelve un 500.
// Caso contrario, registra al usuario en las tablas users y auth_methods,
// Genera un token de authentificacion y responde con el token y los datos del usuario creado
export const signup = async (req, res) => {
  const { username, matricula, email, password } = req.body;

  if (!username) {
    return res.status(400).json({ message: "El nombre de usuario es requerido" });
  }
  if (!matricula) {
    return res.status(400).json({ message: "La matricula es requerida" });
  }
  if (!email) {
    return res.status(400).json({ message: "El email es requerido" });
  }
  if (!password) {
    return res.status(400).json({ message: "La contraseña es requerida" });
  }

  // Se hashea la contraseña antes de guardarla en la DB
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  const userPicture = "/default_avatar_route.png"; // EN DESARROLLO

  // Buscar si el usuario ya existe en la base de datos por email
  db.get(`SELECT id FROM users WHERE email = ?`, [email], (err, row) => {
    if (err) {
      console.error("Error al buscar el usuario:", err.message);
      return res.status(500).send("Error al buscar el usuario en la base de datos");
    }

    if (row) {
      // El usuario ya existe
      console.debug("id encontrado del usuario ya registrado: ", row);
      return res.status(409).send("El email ya está registrado");
    } else {
      // El usuario no existe, proceder con la inserción
      db.run(
        `INSERT INTO users (username, matricula, email, picture) VALUES (?, ?, ?, ?)`,
        [username, matricula, email, userPicture],
        function (err) {
          if (err) {
            console.error("Error al insertar el usuario:", err.message);
            return res.status(500).send("Error al crear el usuario");
          }
          const userId = this.lastID;

          db.run(
            `INSERT INTO auth_methods (user_id, auth_type, auth_details) VALUES (?, 'local', ?)`,
            [userId, passwordHash],
            (err) => {
              if (err) {
                console.error("Error al insertar método de autenticación:", err.message);
                return res.status(500).send("Error al establecer el método de autenticación");
              }
              // Responder al cliente después de la inserción exitosa
              const token = jwt.sign(
                { username: username, email: email, picture: userPicture, matricula: matricula },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
              );

              // Enviar la respuesta
              console.debug("\nUsername Creado:", username);
              console.debug("Email Creado:", email);
              console.debug("Picture Creado:", userPicture);
              console.debug("Matricula Creada:", matricula);

              res.status(201).json({
                message: "Usuario creado exitosamente",
                token: token,
                userData: {
                  username: username,
                  email: email,
                  picture: userPicture,
                  matricula: matricula,
                },
              });
            }
          );
        }
      );
    }
  });
};

// Esta funcion verifica la identidad del usuario mediante su cuenta de Microsoft
// Si la identidad es correcta devuelve los datos del usuario y un token
// Una vez que se verifica la identidad, se busca si el usuario ya existe
// en la base de datos por email, si el usuario no existe se inserta en la DB, en la tabla users y
// despues en auth_methods, Si ya existe obtiene su ID en la DB y responde con un token y los datos del usuario.
// Si la identidad es incorrecta devuevle un 401, Si no se puede guardar en la DB, devuelve un 500
export const loginWithMicrosoft = async (req, res) => {
  const { authCode } = req.body; // Esperamos recibir un 'authCode', no un 'token'
  let payload;

  const client = Client.init({
    authProvider: (done) => {
      done(null, authCode); // Aquí se pasa el token de acceso
    },
  });

  try {
    console.debug("\nControlador loginWithMicrosoft: Ejecutando try principal");
    console.debug("...:: Autentificando usuario con Microsoft ::...");
    const ticket = await client.api("/me");
    payload = await ticket.get();
  } catch (error) {
    console.log(error);
    res.status(401).send("Unauthorized");
  }

  try {
    console.debug("\nControlador loginWithMicrosoft: Ejecutando siguiente try");
    // let { displayName: userName, userPrincipalName: userEmail } = payload;

    let userName = payload.displayName;
    let userEmail = payload.mail || payload.userPrincipalName;
    let userMatricula = "unregistered";
    let userPicture = "/default_avatar_route.png"; // EN DESARROLLO

    console.debug("Contenido de payload de Microsoft: ", payload);

    // Buscamos al usuario en la base de datos por email de Microsoft
    let row = await searchUserByEmail(userEmail);

    if (!row) {
      // Usuario de Microsoft no existe, insertamos al nuevo usuario
      const userId = await insertUser(userName, userEmail, userPicture, userMatricula);
      console.log(`Usuario nuevo insertado con ID: ${userId}`);
    } else {
      // Usuario de Microsoft ya existe, actualizar variables con datos de `row`
      console.debug("Usuario encontrado, valores de row: ", row);

      userName = row.username;
      userMatricula = row.matricula;
      userEmail = row.email;
      userPicture = row.picture;
    }

    // Generamos un token JWT
    const userToken = jwt.sign(
      {
        username: userName,
        email: userEmail,
        picture: userPicture,
        matricula: userMatricula,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    console.debug("\nToken generado:", userToken);

    res.json({
      token: userToken,
      user: {
        username: userName,
        email: userEmail,
        picture: userPicture,
        matricula: userMatricula,
      },
    });
  } catch (err) {
    console.error("Error al manejar la base de datos: ", err);
    return res.status(500).send("Internal Server Error");
  }
};

// Esta funcion verifica la identidad del usuario mediante su cuenta de Google
// Espera recibir un codigo, que no es un token, en el body de la peticion
// Mediante el objeto oAuth2Client se verifica la identidad del usuario y se obtiene un token
// Despues el mismo objeto verifica el token con el metodo verifyIdToken y obtiene una carga
// util que contiene los datos del usuario. Despues busca si el usuario ya existe en la base de datos por email
// si el usuario no existe se inserta en la DB, en la tabla users y
// despues en auth_methods, Si ya existe obtiene su ID en la DB y responde con un token y los datos del usuario.
// Si la identidad es incorrecta devuevle un 401, Si no se puede guardar en la DB, devuelve un 500
export const loginWithGoogle = async (req, res) => {
  const { code } = req.body; // Esperamos recibir un 'code', no un 'token'
  const { tokens } = await oAuth2Client.getToken(code);
  // console.debug("Tokens recibidos: ", tokens);
  let payload;

  try {
    console.debug("Controlador loginWithGoogle: Ejecutando try principal");
    console.debug("...:: Autentificando usuario con Google ::...");
    //Este await es importante. De lo contrario la funcion getPayload no podra ser llamada
    const ticket = await oAuth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: CLIENT_ID,
    });

    payload = ticket.getPayload();
    console.debug(`\nInformación del usuario en controlador de Google: ${JSON.stringify(payload)}`);
  } catch (err) {
    console.error("Error al intercambiar el código por tokens: ", err);
    res.status(401).send("Unauthorized");
  }

  try {
    console.debug("\nControlador loginWithGoogle: Ejecutando siguiente try");
    let { name: userName, email: userEmail, picture: userPicture } = payload;
    let userMatricula = "unregistered";

    // Buscamos al usuario en la base de datos por email de Google
    let row = await searchUserByEmail(userEmail);

    if (!row) {
      // Usuario de Google no existe, insertamos al nuevo usuario
      const userId = await insertUser(userName, userEmail, userPicture, userMatricula);
      console.log(`Usuario nuevo insertado con ID: ${userId}`);
    } else {
      // Usuario de Google ya existe, actualizar variables con datos de `row`
      console.debug("Usuario encontrado, valores de row: ", row);

      userName = row.username;
      userMatricula = row.matricula;
      userEmail = row.email;
      userPicture = row.picture;
    }

    // Generamos un token JWT
    const userToken = jwt.sign(
      {
        username: userName,
        email: userEmail,
        picture: userPicture,
        matricula: userMatricula,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    console.debug("\nToken generado:", userToken);
    res.json({
      userToken,
      userInfo: {
        username: userName,
        email: userEmail,
        picture: userPicture,
        matricula: userMatricula,
      },
    });
  } catch (err) {
    console.error("Error al manejar la base de datos: ", err);
    return res.status(500).send("Internal Server Error");
  }
};

// // EXPERIMENTAL, EN DESARROLLO

// // Esta funcion recibe el token recibido por el cliente desde
// // ProfilePage.js para actualizar los datos del usuario autenticado.
// // Verificamos que el token sea correcto y luego actualizamos los campos
// // correspondientes con los nuevos valores enviados por el cliente.
// export const updateUser = async (req, res) => {
//   const token = req.body.token;
//   let user = await User.findByToken(token);

//   // Comprobamos que el token sea correcto
//   if (!user) return res.status(401).json({ message: "No autorizado" });

//   // Actualizamos los campos del usuario
//   user = await User.update(user._id, req.body);

//   // Devolvemos al usuario actualizado
//   res.json(user);
// };

// // Funcion encargada de cerrar la sesión del usuario autenticado.
// // Envia un token vacío al cliente para que se desconecte.
// // EXPERIMENTAL, EN DESARROLLO
// export const logout = (req, res) => {
//   res.json({ token: "" });
// };
