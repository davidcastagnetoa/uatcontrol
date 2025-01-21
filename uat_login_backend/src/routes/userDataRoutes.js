import express from "express";
import {
  saveUserUAT,
  getAllUserUATs,
  removeUserUAT,
  getUserProfile,
  updateUserProfileController,
  proxyUAT,
  deleteUser,
} from "../controllers/userDataController.js";
import { verifyUserToken } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import path from "path";
import { fileURLToPath } from "url"; // Importa fileURLToPath

import { updateProfilePicture } from "../controllers/userDataController.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const router = express.Router();

//* Ruta para servir la carpeta de imágenes como un recurso estático
router.use("/uploads", express.static(path.join(__dirname, "uploads")));

// - Ruta para actualizar la imagen del perfil del usuario desde el cliente, En desarrollo
router.post("/profile/picture", upload.single("profilePicture"), updateProfilePicture);

// * Ruta para guardar UATs del usuario en la DB
router.post("/save_uat_data", verifyUserToken, saveUserUAT);

// * Ruta para obtener UATs del usuario en la DB
router.get("/get_uat_data", verifyUserToken, getAllUserUATs);

// * Ruta para eliminar una UAT del usuario de la DB
router.delete("/delete_uat_data", verifyUserToken, removeUserUAT);

// * Ruta para obtener datos de perfil del usuario
router.get("/profile", verifyUserToken, getUserProfile);

// - Ruta para obtener la url de la UAT y redirigir al cliente sin mostrar la url (*), En desarrollo
router.get("/proxy", verifyUserToken, proxyUAT);

// * Ruta para actualizar datos de perfil del usuario
router.put("/profile", verifyUserToken, updateUserProfileController);

// * Ruta para eliminar a un usuario de la DB
router.delete("/deleteUser", verifyUserToken, deleteUser);

export default router;

// Cómo funciona upload.single('profilePicture'):
// Cliente envía un archivo: El cliente (navegador o aplicación)
// envía una solicitud HTTP POST con un archivo en el campo del formulario llamado profilePicture.

// Middleware de Multer intercepta la solicitud: Cuando Multer intercepta esta solicitud,
// el middleware extrae el archivo contenido en el campo profilePicture,
// lo procesa y lo agrega al objeto req.

// El archivo queda disponible en req.file: Multer coloca el archivo en el objeto
// req.file de la solicitud HTTP, de modo que el controlador puede acceder
// a este archivo para guardarlo o procesarlo.

//! El valor 'profilePicture' es el nombre del campo del
//! formulario que se espera que contenga el archivo.
//! Este nombre debe coincidir con el atributo name del input de tipo
//! file en el formulario que está enviando el archivo al servidor
{
  /* <form action="/profile/picture" method="POST" enctype="multipart/form-data">
  <input type="file" name="profilePicture" />
  <button type="submit">Subir Imagen</button>
</form> */
}
