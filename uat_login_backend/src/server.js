import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import userDataRoutes from "./routes/userDataRoutes.js";
import { initializeDatabase, closeDatabase } from "../utils/db.js";

// Importa variables de entorno desde el archivo .env
dotenv.config();

// Inicializa la Base de Datos
initializeDatabase();

// Inicializa Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Montar los routers con el prefijo adecuado
app.use("/api", authRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", userDataRoutes);

// Puerto de escucha
const PORT = process.env.PORT || 8080;

// Inicia el servidor
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Cierre del servidor
const gracefulShutdown = () => {
  console.log("Cerrando el servidor...");
  server.close(() => {
    console.log("Servidor cerrado.");
    // Cierre de base de datos
    closeDatabase();
  });
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
