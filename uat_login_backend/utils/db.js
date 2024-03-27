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

const initializeDatabase = () => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    matricula TEXT NOT NULL,
    email TEXT NOT NULL,
    picture TEXT NOT NULL
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
        console.log("Tablas creadas o ya existentes correctamente.");
      }
    }
  );
};

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
