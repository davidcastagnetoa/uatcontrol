import dotenv from "dotenv";

// Cargar las variables de entorno desde .env al proceso
dotenv.config();

// Exportar las variables de entorno como constantes para ser utilizadas en otros módulos
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// Control de credenciales y errores para debug
if (!GOOGLE_CLIENT_ID) {
  console.log("Google client ID environment variable not set. Please add GOOGLE_CLIENT_ID to .env file.");
}
if (!GOOGLE_CLIENT_SECRET) {
  console.log("Google Secret environment variable not set. Please add GOOGLE_CLIENT_SECRET to .env file.");
}

export { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET, JWT_REFRESH_SECRET };
