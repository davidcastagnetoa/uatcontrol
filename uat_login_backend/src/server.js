import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// Asegúrate de importar cualquier otro archivo necesario correctamente

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Montar los routers con el prefijo adecuado
app.use("/api", authRoutes);
app.use("/api", dashboardRoutes); // Ajustado para incluir el prefijo '/api' aquí
app.use("/api", userRoutes); // Ajustado de manera similar

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
