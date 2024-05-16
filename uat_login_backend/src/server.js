import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
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

// Configura cookie-parser
app.use(cookieParser());

// Configuración de CORS para permitir solicitudes con credenciales
const corsOptions = {
  origin: "http://localhost:3000", // Especifica el origen permitido
  credentials: true, // Permite el envío de cookies y headers de autenticación
  optionsSuccessStatus: 200, // Algunos navegadores (IE11, varios SmartTVs) fallan con 204
};

// Aplica la configuración CORS
app.use(cors(corsOptions));

// Middleware para parsear JSON
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
