import { db } from "../../utils/db.js";
import bcrypt from "bcrypt";

/**
 * Recupera los detalles completos de un usuario desde la base de datos utilizando
 * su nombre de usuario, incluyendo la autenticación y otros datos personales
 * */
const getUserByUsername = (username) => {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT users.username, users.email, users.picture, users.matricula, users.usergroup, auth_methods.auth_details
      FROM users
      JOIN auth_methods ON users.id = auth_methods.user_id
      WHERE users.username = ? AND auth_methods.auth_type = 'local'`,
      [username],
      (err, row) => {
        if (err) {
          console.debug(`Error al consultar la base de datos: ${err.message}`);
          reject(new Error(`Error al consultar la base de datos: ${err.message}`));
        } else if (!row || !row.auth_details) {
          console.debug("Usuario no encontrado o no tiene autenticación local");
          reject(new Error("Usuario no encontrado o no tiene autenticación local"));
        } else {
          resolve(row);
        }
      }
    );
  });
};

/**
 * Verifica si ya existe un usuario con el correo
 * electrónico proporcionado en la base de datos
 * */
const checkUserExists = (email) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT id FROM users WHERE email = ?`, [email], (err, row) => {
      if (err) {
        reject(new Error("Error al buscar el usuario en la base de datos"));
      } else if (row) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};

/**
 * Inserta un nuevo usuario en la base de datos,
 * almacenando información esencial junto con una contraseña hasheada
 * */
const createUser = (username, matricula, email, password) => {
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);
  const userPicture = "/default_avatar_route.png";
  const userRoll = "usuario";

  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO users (username, matricula, email, picture, usergroup) VALUES (?, ?, ?, ?, ?)`,
      [username, matricula, email, userPicture, userRoll],
      function (err) {
        if (err) {
          reject(new Error("Error al crear el usuario"));
        } else {
          const userId = this.lastID;
          db.run(
            `INSERT INTO auth_methods (user_id, auth_type, auth_details) VALUES (?, 'local', ?)`,
            [userId, passwordHash],
            (err) => {
              if (err) {
                reject(new Error("Error al establecer el método de autenticación"));
              } else {
                resolve(userId);
              }
            }
          );
        }
      }
    );
  });
};

/**
 * Recupera los detalles completos de un usuario basado en su
 * ID de la base de datos, asegurando que los datos recién creados sean correctos y actuales
 * */
const getUserById = (userId) => {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT username, email, matricula, picture, usergroup FROM users WHERE id = ?`,
      [userId],
      (err, row) => {
        if (err) {
          console.debug("Error al recuperar el usuario:", err.message);
          const error = new Error("Error al recuperar el usuario");
          console.error(error);
          reject(error);
        } else if (row) {
          resolve(row);
        } else {
          reject(new Error("Usuario no encontrado después de la creación"));
        }
      }
    );
  });
};

/**
 * Recupera los detalles completos de un usuario basado en su
 * email de la base de datos.
 * */
const searchUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
      if (err) {
        console.debug("Error al buscar el usuario por email:", err.message);
        const error = new Error("Error al buscar el usuario por email");
        console.error(error);
        reject(error);
      } else {
        resolve(row);
      }
    });
  });
};

/**
 * Inserta o actualiza un usuario en la base de datos.
 * Si el usuario no existe, se crea. Si ya existe, se actualizan sus datos.
 * */
const insertOrUpdateGoogleUser = async (
  userName,
  userEmail,
  userPicture,
  userMatricula = "unregistered",
  userRoll = "usuario"
) => {
  let user = await searchUserByEmail(userEmail);
  if (!user) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO users (username, email, picture, matricula, usergroup) VALUES (?, ?, ?, ?, ?)`,
        [userName, userEmail, userPicture, userMatricula, userRoll],
        function (err) {
          if (err) reject(new Error("Error al insertar el usuario"));
          else resolve(this.lastID);
        }
      );
    });
  }
  return user;
};

export {
  getUserByUsername,
  getUserById,
  checkUserExists,
  createUser,
  searchUserByEmail,
  insertOrUpdateGoogleUser,
};
