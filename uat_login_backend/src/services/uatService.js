import { db } from "../../utils/db.js";
import { searchUserByEmail } from "./userService.js";

//  * Elimina de la Base de Datos una UAT segun el usuario al que pertenece , su script, link y osa
const deleteUserUATById = (userId, script, link, osa) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Primero, obtén la UAT usando los parámetros dados para obtener la id específica
      const uat = await getUserUATByParams(userId, script, link, osa);
      if (uat) {
        // Si la UAT existe, procede a eliminarla usando su id
        db.run(`DELETE FROM uat_collection WHERE id = ?`, [uat.id], function (err) {
          if (err) {
            console.log("Error al eliminar la UAT:", err.message);
            reject(err);
          } else {
            console.log(`UAT con id ${uat.id} eliminada correctamente.`);
            resolve(this.changes); // this.changes devuelve el número de filas afectadas
          }
        });
      } else {
        console.log("No se encontró la UAT con los parámetros dados.");
        resolve(0); // No se encontró la UAT, por lo tanto, no se eliminó ninguna fila
      }
    } catch (error) {
      reject(error);
    }
  });
};

//  * Extraer todas las UAT del usuario usando su email. Resuelve un array
const getAllUserUATsByEmail = (email) => {
  return new Promise((resolve, reject) => {
    // Primero, obtén el userId basado en el email
    db.get(`SELECT id FROM users WHERE email = ?`, [email], (err, user) => {
      if (err) {
        console.log("Error al obtener el userId:", err.message);
        reject(err);
      } else if (user) {
        // Ahora, obtén todas las UAT para el userId encontrado
        db.all(`SELECT * FROM uat_collection WHERE user_id = ?`, [user.id], (err, rows) => {
          if (err) {
            console.log("Error al obtener las UATs:", err.message);
            reject(err);
          } else {
            // console.debug("UATs halladas: ", rows);
            resolve(rows);
          }
        });
      } else {
        // Si no hay usuario con ese email, devuelve un arreglo vacío
        resolve([]);
      }
    });
  });
};

// - Obtiene la ID de la UAT a buscar, Solo para comprobar su existencia
const getUATById = (uatId) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM uat_collection WHERE id = ?`, [uatId], (err, row) => {
      if (err) {
        console.log("Error al buscar la UAT por ID:", err.message);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// - Recupera específicamente la URL de una UAT que se necesita para el proxy
const getUATUrlByEmailAndId = (userEmail, uatId) => {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT u.link FROM uat_collection u JOIN users usr ON u.user_id = usr.id WHERE usr.email = ? AND u.id = ?`,
      [userEmail, uatId],
      (err, row) => {
        if (err) {
          console.debug("\nError al obtener la URL de UAT:", err.message);
          reject(err);
        } else if (row) {
          console.debug("\nUAT encontrada");
          resolve(row.link);
        } else {
          console.debug("\nNo existe UAT");
          resolve(null);
        }
      }
    );
  });
};

//  * Extraer una UAT del usuario usando su userId
const getUserUATByParams = (userId, script, link, osa) => {
  return new Promise((resolve, reject) => {
    // Busca una UAT específica para el userId dado y que coincida con los parámetros proporcionados
    db.get(
      `SELECT * FROM uat_collection WHERE user_id = ? AND script = ? AND link = ? AND osa = ?`,
      [userId, script, link, osa],
      (err, row) => {
        if (err) {
          console.log("Error al obtener la UAT:", err.message);
          reject(err);
        } else if (row) {
          // UAT encontrada
          console.info("UAT encontrada:", row);
          resolve(row);
        } else {
          // Si no hay UAT que coincida con esos parámetros, devuelve null
          console.warn("No se encontró ninguna UAT que coincida con los parámetros proporcionados.");
          resolve(null);
        }
      }
    );
  });
};

// * Obtener el número de UATs por estado de un usuario
const getUserUATsStatusCountsByEmail = async (email) => {
  try {
    const uats = await getAllUserUATsByEmail(email);
    if (uats.length === 0) {
      return [];
    }

    const counts = uats.reduce((acc, uat) => {
      acc[uat.status] = (acc[uat.status] || 0) + 1;
      return acc;
    }, {});

    const total = uats.reduce((acc, curr) => acc + 1, 0);

    const stats = Object.keys(counts).map((status) => ({
      status,
      count: counts[status],
      percentage: parseFloat(((counts[status] / total) * 100).toFixed(2)),
    }));

    return {
      message: "Estadísticas de estados de UATs",
      data: stats,
    };
  } catch (error) {
    console.log("Error al obtener las estadísticas de UATs por email:", error);
    throw error; // Lanzar error para que el controlador lo maneje
  }
};

//  * Insertar una nueva UAT en la colección de UATs del usuario. Resuelve su ID.
const insertUatCollection = (userId, script, link, osa, status) => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO uat_collection (user_id, script, link, osa, status) VALUES (?, ?, ?, ?, ?)`,
      [userId, script, link, osa, status],
      function (err) {
        if (err) {
          console.log("Error al insertar el UAT:", err.message);
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
};

// * Verifica si un usuario es administrador
const isAdmin = async (email) => {
  const user = await searchUserByEmail(email);
  if (!user) {
    console.log("El usuario no existe.");
    throw new Error("El usuario no existe.");
  }
  if (user.usergroup !== "administrador") {
    console.log("Acceso denegado. No tienes privilegios de administrador.");
    throw new Error("Acceso denegado. No tienes privilegios de administrador.");
  }
  return true;
};

// * Obtiene todos los usuarios
const getAllUsers = async () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM users", [], (err, rows) => {
      if (err) {
        reject(new Error("Error al obtener todos los usuarios: " + err.message));
      } else {
        resolve(rows);
      }
    });
  });
};

// * Retorna todos los usuarios si el usuario es administrador
const getAllUserByAdmin = async (email) => {
  await isAdmin(email);
  return getAllUsers();
};

// - Actualiza en la Base de Datos una UAT segun el usuario al que pertenece , su script, link y osa
// ! EN DESARROLLO
const updateUatCollection = (userId, uatId, updates) => {
  // Implementar lógica para actualizar una UAT específica
  return new Promise((res, rej) => {
    // Primero, obtén la UAT usando los parámetros dados para obtener la id específica
    db.get(`SELECT * FROM uat_collection WHERE user_id = ? AND id = ?`, [userId, uatId], (err, row) => {
      if (err) {
        console.log("Error al obtener la UAT:", err.message);
        rej(err);
      } else if (row) {
        // Si la UAT existe, procede a actualizarla usando su id
        db.run(
          `UPDATE uat_collection SET script = ?, link = ?, osa = ?, status = ? WHERE id = ?`,
          [updates.script, updates.link, updates.osa, updates.status, uatId],
          function (err) {
            if (err) {
              console.log("Error al actualizar la UAT:", err.message);
              rej(err);
            } else {
              console.log(`UAT con id ${uatId} actualizada correctamente.`);
              res(this.changes);
            }
          }
        );
      }
    });
  });
};

export {
  deleteUserUATById,
  getAllUserByAdmin,
  getAllUserUATsByEmail,
  getUATById,
  getUATUrlByEmailAndId,
  getUserUATByParams,
  getUserUATsStatusCountsByEmail,
  insertUatCollection,
  isAdmin,
  updateUatCollection,
};
