import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import sqlite3 from "sqlite3";

// - Obtiene la ruta del directorio actual basado en import.meta.url
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Establecer la ruta al archivo de la base de datos
const databasePath = path.resolve(__dirname, "../data.sqlite3");

// - Verifica que el directorio donde se almacenará la base de datos existe
if (!fs.existsSync(databasePath)) {
  const directory = path.dirname(databasePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

// * Abrir la base de datos, lo que creará el archivo si no existe
const db = new sqlite3.Database(databasePath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error("Error al abrir la base de datos", err.message);
  } else {
    console.log("Conectado a la base de datos SQLite.");
    // Aquí podrías llamar a una función para inicializar las tablas si es necesario
  }
});

// * Iniciar la base de datos y crear las tablas si no existen.
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

// * Cerrar la base de datos.
const closeDatabase = () => {
  db.close((err) => {
    if (err) {
      console.error("Error al cerrar la base de datos", err.message);
    } else {
      console.log("Conexión a la base de datos cerrada.");
    }
  });
};

export { db, initializeDatabase, closeDatabase };

// FRAMEWORKS DE DB, ORM, buscar , middleware
