import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import cors from "cors";
// import authRouter from "./auth";
import bcrypt from "bcrypt";
import fs from "fs";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
// app.use("/auth", authRouter);

// Ruta para el inicio de sesión
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  // Aquí verificarías contra una base de datos, para este ejemplo compararemos con las variables de entorno
  if (username === process.env.USER_NAME && password === process.env.USER_PASSWORD) {
    // Generar un token
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } else {
    // Credenciales no válidas
    res.status(401).json({ message: "Credenciales no válidas" });
  }
});

// Ruta para la verificacion del token
app.post("/api/verifyToken", (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    res.json({ valid: true, username: user.username });
  });
});

// Ruta para navegar al dashboard
app.get("/api/dashboard", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ message: `Bienvenido al dashboard, ${payload.username}` });
  } catch (error) {
    res.sendStatus(401);
  }
});

//Ruta para guardar una UAT del usuario
app.post("/api/save-data", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { uatLink, uatScript, uatId } = req.body;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);

    const username = decoded.username; // Asume que el token incluye el username
    const matricula = "DI4697"; // Este valor debería obtenerse de alguna manera, aquí está hardcodeado para el ejemplo

    fs.readFile("data.json", "utf8", (err, dataJson) => {
      if (err) {
        console.error("Error leyendo el archivo:", err);
        return res.status(500).send("Error al procesar los datos");
      }

      let data;
      try {
        data = JSON.parse(dataJson || "{}");
      } catch (parseError) {
        console.error("Error al parsear el archivo JSON:", parseError);
        return res.status(500).send("Error al procesar los datos");
      }

      // Verificar si el usuario ya existe
      let user = data[username];
      if (!user) {
        // Si el usuario no existe, inicializarlo
        user = { matricula, username, uat_collection: [] };
        data[username] = user;
      }

      // Agregar el nuevo UAT a la colección del usuario
      const newUat = { id: uatId, script: uatScript, link: uatLink };
      user.uat_collection.push(newUat);

      fs.writeFile("data.json", JSON.stringify(data, null, 2), (writeError) => {
        if (writeError) {
          console.error("Error al escribir en el archivo:", writeError);
          return res.status(500).send("Error al guardar los datos");
        }
        res.json({ message: "Datos guardados" });
      });
    });
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
