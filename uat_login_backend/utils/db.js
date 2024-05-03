import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import sqlite3 from "sqlite3";

// Obtiene la ruta del directorio actual basado en import.meta.url
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Establecer la ruta al archivo de la base de datos
const databasePath = path.resolve(__dirname, "../data.sqlite3");

// Asegúrate de que el directorio donde se almacenará la base de datos existe
if (!fs.existsSync(databasePath)) {
  const directory = path.dirname(databasePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

// Abrir la base de datos, lo que creará el archivo si no existe
const db = new sqlite3.Database(
  databasePath,
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error("Error al abrir la base de datos", err.message);
    } else {
      console.log("Conectado a la base de datos SQLite.");
      // Aquí podrías llamar a una función para inicializar las tablas si es necesario
    }
  }
);

// Iniciar la base de datos y crear las tablas si no existen.
const initializeDatabase = () => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    matricula TEXT,
    email TEXT NOT NULL UNIQUE,
    picture TEXT
    usergroup TEXT NOT NULL
  )`);

  // auth_details TEXT -- Hash de contraseña para 'local', ID de OAuth para 'google'
  // auth_type TEXT NOT NULL,  -- Por ejemplo, 'local' o 'google'
  // Considerar índices para auth_type si se realizan muchas consultas basadas en este campo

  db.run(`CREATE TABLE IF NOT EXISTS auth_methods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    auth_type TEXT NOT NULL,
    auth_details TEXT,  
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  db.run(
    `CREATE TABLE IF NOT EXISTS uat_collection (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    script TEXT NOT NULL,
    link TEXT NOT NULL,
    osa TEXT NOT NULL,
    status TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`,
    (err) => {
      if (err) {
        console.error("Error al crear las tablas:", err.message);
      } else {
        console.debug("Tablas creadas o ya existentes correctamente.");
      }
    }
  );
};

// Cerrar la base de datos.
const closeDatabase = () => {
  db.close((err) => {
    if (err) {
      console.error("Error al cerrar la base de datos", err.message);
    } else {
      console.log("Conexión a la base de datos cerrada.");
    }
  });
};

// Buscar un usuario por email.
const searchUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
      if (err) {
        console.error("Error al buscar el usuario:", err.message);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// Buscar un usuario por username
const searchUserByUsername = (username) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
      if (err) {
        console.error("Error al buscar el usuario:", err.message);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// Inserta un nuevo usuario en la BD. Resuelve su ID
const insertUser = (userName, userEmail, userPicture, userMatricula, userRoll) => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO users (username, email, picture, matricula, usergroup) VALUES (?, ?, ?, ?, ?)`,
      [userName, userEmail, userPicture, userMatricula, userRoll],
      function (err) {
        if (err) {
          console.error("Error al insertar el usuario:", err.message);
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
};

// Extraer todas las UAT del usuario usando su email
const getAllUserUATsByEmail = (email) => {
  return new Promise((resolve, reject) => {
    // Primero, obtén el userId basado en el email
    db.get(`SELECT id FROM users WHERE email = ?`, [email], (err, user) => {
      if (err) {
        console.error("Error al obtener el userId:", err.message);
        reject(err);
      } else if (user) {
        // Ahora, obtén todas las UAT para el userId encontrado
        db.all(`SELECT * FROM uat_collection WHERE user_id = ?`, [user.id], (err, rows) => {
          if (err) {
            console.error("Error al obtener las UATs:", err.message);
            reject(err);
          } else {
            // console.debug("UATs halladas: ", rows);
            resolve(rows);
          }
        });
      } else {
        // Si no hay usuario con ese email, devuelve un arreglo vacío
        resolve([]);
      }
    });
  });
};

// Extraer una unica UAT del usuario usando su userId (NO EN USO, PENSADA PARA ENCONTRAR UAT. PARA BUSQUEDA EN CLIENTE)
const getUserUATByParams = (userId, script, link, osa) => {
  return new Promise((resolve, reject) => {
    // Busca una UAT específica para el userId dado y que coincida con los parámetros proporcionados
    db.get(
      `SELECT * FROM uat_collection WHERE user_id = ? AND script = ? AND link = ? AND osa = ?`,
      [userId, script, link, osa],
      (err, row) => {
        if (err) {
          console.error("Error al obtener la UAT:", err.message);
          reject(err);
        } else if (row) {
          // UAT encontrada
          console.info("UAT encontrada:", row);
          resolve(row);
        } else {
          // Si no hay UAT que coincida con esos parámetros, devuelve null
          console.warn(
            "No se encontró ninguna UAT que coincida con los parámetros proporcionados."
          );
          resolve(null);
        }
      }
    );
  });
};

// Elimina de la Base de Datos una UAT segun el usuario al que pertenece , su script, link y osa
const deleteUserUATById = (userId, script, link, osa) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Primero, obtén la UAT usando los parámetros dados para obtener la id específica
      const uat = await getUserUATByParams(userId, script, link, osa);
      if (uat) {
        // Si la UAT existe, procede a eliminarla usando su id
        db.run(`DELETE FROM uat_collection WHERE id = ?`, [uat.id], function (err) {
          if (err) {
            console.error("Error al eliminar la UAT:", err.message);
            reject(err);
          } else {
            console.log(`UAT con id ${uat.id} eliminada correctamente.`);
            resolve(this.changes); // this.changes devuelve el número de filas afectadas
          }
        });
      } else {
        console.log("No se encontró la UAT con los parámetros dados.");
        resolve(0); // No se encontró la UAT, por lo tanto, no se eliminó ninguna fila
      }
    } catch (error) {
      reject(error);
    }
  });
};

// Insertar una nueva UAT en la colección de UATs del usuario. Resuelve su ID.
const insertUatCollection = (userId, script, link, osa, status) => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO uat_collection (user_id, script, link, osa, status) VALUES (?, ?, ?, ?, ?)`,
      [userId, script, link, osa, status],

      function (err) {
        if (err) {
          console.error("Error al insertar el UAT:", err.message);
          reject(err);
        }
        resolve(this.lastID);
      }
    );
  });
};

// Obtener el número de UATs por estado de un usuario
const getUserUATsStatusCountsByEmail = (email) => {
  return new Promise(async (resolve, reject) => {
    try {
      const uats = await getAllUserUATsByEmail(email);
      if (uats.length === 0) {
        // Si no hay UATs para el usuario, devuelve un arreglo vacío
        resolve([]);
        return;
      }

      // Procesa los resultados para contar los estados
      const counts = uats.reduce((acc, uat) => {
        acc[uat.status] = (acc[uat.status] || 0) + 1;
        return acc;
      }, {});

      // Convierte el objeto de conteos en un array de objetos para incluir los porcentajes
      const total = uats.length;
      const stats = Object.keys(counts).map((status) => ({
        status,
        count: counts[status],
        percentage: ((counts[status] / total) * 100).toFixed(2) + "%",
      }));

      resolve(stats);
    } catch (error) {
      console.error("Error al obtener las estadísticas de UATs por email:", error);
      reject(error);
    }
  });
};

// EN DESARROLLO:
// Obtener todos los usuarios, solo para administradores
const getAllUserByAdmin = (email) => {
  return new Promise((resolve, reject) => {
    searchUserByEmail(email)
      .then((user) => {
        // Verifica si el usuario es administrador
        if (user.usergroup !== "administrador") {
          reject(new Error("Acceso denegado. No tienes privilegios de administrador."));
        } else {
          // El usuario es administrador, procede a obtener todos los usuarios
          db.all("SELECT * FROM users", [], (err, rows) => {
            if (err) {
              console.error("Error al obtener todos los usuarios:", err.message);
              reject(err);
            } else {
              resolve(rows);
            }
          });
        }
      })
      .catch((error) => {
        console.error("Error al buscar el usuario por email:", error.message);
        reject(error);
      });
  });
};

export {
  db,
  initializeDatabase,
  closeDatabase,
  searchUserByEmail,
  searchUserByUsername,
  insertUser,
  getAllUserUATsByEmail,
  getUserUATByParams,
  deleteUserUATById,
  insertUatCollection,
  getUserUATsStatusCountsByEmail,
  getAllUserByAdmin,
};

// USAR CLASES
// FRAMEWORKS DE DB, ORM, buscar , middleware
