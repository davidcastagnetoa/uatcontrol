creo que estamos confundiendo el cambiar la imagen de perfil desde el cliente con guardar la imagen de perfil una vez obtnida cuando el usuario inicia sesion mediante su cuenta de microsoft . me has dado los pasos y funciones , controladores y rutas necesarias para cambiar la imagen de perfil desde el cliente.
Pero si quisiera simplemente guardar la imagen de perfil una vez obtenida cuando el usuario inicia sesion mediante su cuenta de microsoft. Que cambios debo hacer?

Mi logica actual es la siguiente:
Actualmente disopngo de este controlador que autentica a los usuarios mediante Microsoft OAuth, recuperando y gestionando sus datos desde la DB para luego generar un token JWT. Devuelve el token y los datos del usuario.

```js
export const loginWithMicrosoft = async (req, res) => {
const { authCode } = req.body;

try {
const { userName, userEmail, userPicture, id } = await getMicrosoftUser(authCode);

    const userData = await insertOrUpdateMicrosoftUser(userName, userEmail, userPicture, undefined, undefined, id);

    const microsoftPayload = {
      username: userData.username,
      email: userData.email,
      // picture: userData.picture, //! No se codifica la imagen de perfil en el TOKEN, dado que el enlace es muy largo para JWT
      matricula: userData.matricula,
      rol: userData.usergroup,
    };

    const accessToken = generateAccessToken(microsoftPayload);
    const refreshToken = generateRefreshToken(microsoftPayload);

    // res.cookie("accessToken", accessToken, {
    //   httpOnly: true,
    //   secure: false, //! Solo activa 'secure' en producción
    //   // secure: process.env.NODE_ENV === "production", //! Solo activa 'secure' en producción
    //   sameSite: "Strict",
    // });
    // res.cookie("refreshToken", refreshToken, {
    //   httpOnly: true,
    //   secure: false, //! Solo activa 'secure' en producción
    //   // secure: process.env.NODE_ENV === "production", //! Solo activa 'secure' en producción
    //   sameSite: "Strict",
    // });

    // console.log("\n Token de acceso generado en Login de Microsoft es:", accessToken);
    // console.log("\n Token de refresco generado en Login de Microsoft es:", refreshToken);

    res.status(200).json({
      accessToken,
      refreshToken,
      user: microsoftPayload,
    });

} catch (err) {
console.log("Error en loginWithMicrosoft:", err);
res.status(err.status || 500).send(err.message || "Internal Server Error");
}
};

```

que a su vez usa este servicio para autenticar y recuperar información básica del usuario de Microsoft

```js
const getMicrosoftUser = async (accessToken) => {
  try {
    const client = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });

    const payload = await client.api("/me").get();
    console.debug(`\nInformación del usuario de Microsoft: ${JSON.stringify(payload)}`);

    var userPicture = "/default_avatar_route.png";

    try {
      // Get the user's profile photo
      const photoResponse = await client.api("/me/photo/$value").get();
      // console.debug("photoResponse: ", photoResponse);

      // Check if the response is a fetch Response object
      if (photoResponse && typeof photoResponse.arrayBuffer === "function") {
        // Read the response as an ArrayBuffer
        const arrayBuffer = await photoResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString("base64");
        const mimeType = "image/jpeg";

        // Set the user picture as a Data URL
        userPicture = `data:${mimeType};base64,${base64Image}`;
        console.debug("Imagen de usuario de Microsoft obtenida correctamente");
      } else {
        console.log("Unexpected response type when fetching user photo.");
        throw new Error("Unexpected response type when fetching user photo.");
      }
    } catch (photoError) {
      if (photoError.code === "ErrorItemNotFound" || photoError.statusCode === 404) {
        console.log("El usuario no tiene una foto de perfil.");
        // Keep the default userPicture
      } else {
        console.log("Error al obtener la foto del usuario: ", photoError.toString());
        throw photoError;
      }
    }

    const userMicrosoftData = {
      userName: payload.displayName,
      userEmail: payload.mail || payload.userPrincipalName,
      userPicture: userPicture,
      id: payload.id,
    };
    return userMicrosoftData;
  } catch (error) {
    console.log("Error al obtener el usuario de Microsoft: ", error.toString());
    throw new Error("Error en la autenticación con Microsoft");
  }
};
```

Y tambien usa este servicio para Insertar o actualiza un usuario en la base de datos, aqui es donde se maneja y guardan los datos del usuario dados por Microsoft en la DB Si el usuario no existe, se crea, Si ya existe, se actualizan sus datos:

```js
const insertOrUpdateMicrosoftUser = async (
userName,
userEmail,
userPicture,
userMatricula = "unregistered",
userRoll = "usuario",
id
) => {
try {
let user = await searchUserByEmail(userEmail);
console.log("Buscando usuario con email:", userEmail);
console.log("Resultado de búsqueda:", user?.id);

    if (!user) {
      return new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO users (username, email, picture, matricula, usergroup) VALUES (?, ?, ?, ?, ?)`,
          [userName, userEmail.toLowerCase(), userPicture, userMatricula, userRoll],
          function (err) {
            if (err) {
              reject(new Error("Error al insertar el usuario: " + err.message));
            } else {
              const userId = this.lastID;

              // Guarda la imagen en la carpeta de imágenes del servidor
              const picturePath = saveUserPicture(userPicture, userId);

              db.run(
                `INSERT INTO auth_methods (user_id, auth_type, auth_details) VALUES (?, 'microsoft', ?)`,
                [userId, id],
                (err) => {
                  if (err) {
                    reject(new Error("Error al establecer el método de autenticación: " + err.message));
                  } else {
                    resolve({
                      id: userId,
                      username: userName,
                      email: userEmail,
                      picture: userPicture, //- Se reemplaza en lugar de userPicture
                      matricula: userMatricula,
                      usergroup: userRoll,
                    });
                  }
                }
              );
            }
          }
        );
      });
    } else {
      return user;
    }

} catch (error) {
console.log("Error en insertOrUpdateMicrosoftUser:", error.message);
throw error;
}
};
```
