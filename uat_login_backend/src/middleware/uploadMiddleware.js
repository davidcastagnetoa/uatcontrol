import multer from "multer";

const storage = multer.memoryStorage(); // Usamos memoria temporal para guardar el archivo
export const upload = multer({ storage });
