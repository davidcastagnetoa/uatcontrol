import { getUserUAT } from "../../utils/db.js";

export const getDashboard = async (req, res) => {
  console.debug("Datos decodificados desde Middleware: ", req.user);
  const username = req.user.username;
  const userPicture = req.user.picture;
  const userEmail = req.user.email;
  const userMatricula = req.user.matricula;

  let payload;

  //Aqui llamamos las UAT de las bases de datos del usuario para mostrarlas en la dashboard

  try {
    console.debug("\n...:: Ejecutando siguiente try ::...");

    // Buscamos las UATs del usuario en la base de datos por email del usuario
    let uatLinks = await getUserUAT(userEmail);
    if (uatLinks) {
      // Si existen las UATs las extraemos
      console.debug(`UATs Encontradas: ${uatLinks}`);
    } else {
      console.debug("UATS no encontradas");
    }
    res.json({
      message: `Welcome back, ${username}`,
      log: "UATs encontradas",
      userData: {
        username: username,
        matricula: userMatricula,
        picture: userPicture,
        email: userEmail,
      },
      userUAT: {
        scripting: "",
        link: "",
        osa: "",
        fecha: "",
      },
    });
  } catch (err) {
    console.error("Usuario no existe en la base de datos: ", err);
    return res.status(500).send("Internal Server Error");
  }
};
