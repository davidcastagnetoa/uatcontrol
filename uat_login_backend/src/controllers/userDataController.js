import { db } from "../../utils/db.js";

export const saveUserData = (req, res) => {
  const { uatLink, uatScript, uatUsername } = req.body;
  console.debug("Datos recibidos en body:", req.body);
  console.debug("Datos recibidos del usuario:", req.user);

  // Nombre de usuario
  const username = req.user.username;
  console.debug("Username encontrado: ", username);

  // Email de usuario
  const email = req.user.email;
  console.debug("Email encontrado: ", email);

  // Ruta de imagen de usuario
  const picture = req.user.picture;
  console.debug("Imagen de Perfil: ", picture);
  const matricula = "DI4697";

  // Primero, intenta obtener el user_id del usuario existente
  db.get(`SELECT id FROM users WHERE username = ?`, [uatUsername], (err, row) => {
    if (err) {
      console.error("Error al buscar el usuario:", err.message);
      return res.status(500).send("Error al buscar el usuario");
    }

    let userId;
    if (row) {
      // El usuario existe, usa su id existente
      userId = row.id;
      insertUatCollection(userId, uatScript, uatLink);
    } else {
      // El usuario no existe, insértalo
      db.run(
        `INSERT INTO users (username, matricula, email, picture) VALUES (?, ?, ?, ?)`,
        [uatUsername, matricula, email, picture],
        function (err) {
          if (err) {
            console.error("Error al insertar el usuario:", err.message);
            return res.status(500).send("Error al procesar los datos del usuario");
          }
          userId = this.lastID; // Ahora tenemos un nuevo userId
          insertUatCollection(userId, uatScript, uatLink);
        }
      );
    }
  });

  function insertUatCollection(userId, script, link) {
    db.run(`INSERT INTO uat_collection (user_id, script, link) VALUES (?, ?, ?)`, [userId, script, link], (err) => {
      if (err) {
        console.error("Error al insertar el UAT:", err.message);
        return res.status(500).send("Error al guardar los datos del UAT");
      }
      res.json({ message: "Datos guardados" });
    });
  }
};
