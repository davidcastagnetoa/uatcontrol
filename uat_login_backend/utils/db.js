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
const db = new sqlite3.Database(databasePath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error("Error al abrir la base de datos", err.message);
  } else {
    console.log("Conectado a la base de datos SQLite.");
    // Aquí podrías llamar a una función para inicializar las tablas si es necesario
  }
});

// Iniciar la base de datos y crear las tablas si no existen.
const initializeDatabase = () => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    matricula TEXT,
    email TEXT NOT NULL UNIQUE,
    picture TEXT
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
const searchUser = (email) => {
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

// Inserta un nuevo usuario en la BD.
const insertUser = (userName, userEmail, userPicture, userMatricula) => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO users (username, email, picture, matricula) VALUES (?, ?, ?, ?)`,
      [userName, userEmail, userPicture, userMatricula],
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

// Extraer las UAT del usuario
const getUserUAT = (userId) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM uat_collection WHERE user_id = ?`, [userId], (err, rows) => {
      if (err) {
        console.error("Error al obtener las UAT:", err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

export { db, initializeDatabase, closeDatabase, searchUser, insertUser, getUserUAT };
