import fs from "fs";

export const saveUserData = (req, res) => {
  const { uatLink, uatScript, uatId } = req.body;
  const username = req.user.username;
  const matricula = "DI4697";
  // Lógica para leer y escribir en data.json
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
};
