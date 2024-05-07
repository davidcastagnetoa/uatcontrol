// AuthProvider.js
import React, { useEffect, useState } from "react";
import AuthContext from "../context/AuthContext";

// ESTE CONTEXTO SE ENCARGA DE GESTIONAR LA AUTENTICACIÓN DEL USUARIO

const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({ status: "pending", user: null });

  // Implementar lógica para verificar autenticación aquí (e.g., verificar token local)
  const verifyToken = async () => {
    console.log("Verificando token...");
    try {
      const token = localStorage.getItem("token");
      if (token) {
        console.log("Token encontrado...", token);
        console.log("Llamando a endpoint http://localhost:8080/api/verifyToken");
        const response = await fetch("http://localhost:8080/api/verifyToken", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "Access-Control-Allow-Origin": "*", //AÑADIDO
            Accept: "*/*", //AÑADIDO
          },
        });

        console.warn("Respuesta recibida: ", response);

        if (response.ok) {
          console.log("Respuesta recibida.");
          const data = await response.json();
          // Suponiendo que el backend responde con un campo `valid` para indicar si el token es válido
          console.warn("Respuesta del servidor:", JSON.stringify(data));
          console.warn("Nombre de usuario recibido:", JSON.stringify(data?.username));
          console.warn("Email de usuario recibido:", JSON.stringify(data?.email));
          console.warn("Foto de perfil de usuario recibido:", JSON.stringify(data?.picture));
          console.log("Token válido:", data.valid);

          if (data.valid) {
            localStorage.setItem("token", data.token);
            if (data.username) {
              const username = data?.username;
              const email = data?.email;
              const picture = data?.picture;
              setAuthState({ status: "authenticated", token, user: { username, email, picture } });
            } else {
              setAuthState({ status: "authenticated", token });
            }
            console.warn(
              "Contenido de authState obtenido de la funcion asincrona verifyToken: " + JSON.stringify(authState)
            );
            return true;
          } else {
            throw new Error("Token no válido");
          }
        } else {
          console.error("Respuesta NO recibida.");
          throw new Error("Error en la verificación del token");
        }
      } else {
        // Si no hay token, establecer el estado como anónimo
        console.log("No token found");
        throw new Error("No token found");
      }
    } catch (error) {
      console.log("Error al verificar Token: " + error);
      setAuthState({ status: "anonymous", token: null });
      localStorage.removeItem("token");
      return false;
    }
  };

  // Efecto para verificar el token al cargar la aplicación
  useEffect(() => {
    verifyToken();
  }, []);

  // Función de login actualizada para almacenar el token,
  // esta funcion comprueba en el servidor usuario y contraseña, si los datos son correctos,
  // se trae el token que genera el servidor y devuelve el true que necesita
  const login = async (username, password) => {
    console.log("Iniciando sesión,  usuario: ", username);
    try {
      // Realizar una petición al servidor para iniciar sesión
      console.log("Llamando a endpoint http://localhost:8080/api/login");
      const response = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*", //AÑADIDO
          Accept: "*/*", //AÑADIDO
        },
        body: JSON.stringify({ username, password }),
      });

      console.warn("Respuesta recibida del servidor al intentar iniciar sesión: ", response);

      if (!response.ok) {
        // Si el servidor responde con un código de error, manejarlo aquí
        throw new Error("Error en la respuesta del servidor");
      }

      const data = await response.json();
      console.warn("Dato recibido del servidor: ", data);

      if (data.token) {
        // Como el servidor (login de authController.js) responde con un objeto que contiene el token
        // si las credenciales son correctas, se almacena dicho token en el localStore. Es necesario
        // almacenar dicho token en el localStore, ya que el contexto AuthContext comprueba
        // dicho token (authState.status) para verificar si el usuario esta authenticado o no.
        // Ya que las rutas protegidas solo se acceden si el Contenido de authState.status es "authenticated"

        const email = data?.userData.email;
        const picture = data?.userData.picture;

        localStorage.setItem("token", data.token);
        setAuthState({ status: "authenticated", user: { username, email, picture }, token: data.token });
        return true; // Indicar que el inicio de sesión fue exitoso
      } else {
        console.log("Token no proporcionado");
        throw new Error("Token no proporcionado");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setAuthState({ status: "error", user: null, token: null });
      return false; // Indicar que el inicio de sesión falló
    }
  };

  // Función de logout actualizada para limpiar el token
  const logout = () => {
    localStorage.removeItem("token");
    setAuthState({ status: "anonymous", token: null });
    // Redirigir al usuario al login
    // Dependiendo de tu enrutador, esto podría ser diferente
    window.location.href = "/login";
  };

  // Funcion de signup para dar de alta a un nuevo usuario
  const signup = async (username, email, matricula, password) => {
    console.log("Creando a nuevo usuario: ", username);

    try {
      // Realizar una petición al servidor para iniciar sesión
      console.log("Llamando a endpoint http://localhost:8080/api/signup");
      const response = await fetch("http://localhost:8080/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Accept: "*/*",
        },
        body: JSON.stringify({ username, email, matricula, password }),
      });

      console.warn("Respuesta recibida del servidor al intentar iniciar sesión: ", response);

      if (!response.ok) {
        // Si el servidor responde con un código de error, se lanza error
        throw new Error("Error en la respuesta del servidor, verifica los argumentos del controlador, o el cliente");
      }

      const data = await response.json();
      // El servidor debe generar un token
      console.warn("Dato recibido del servidor: ", data);

      if (data.token) {
        // Como el servidor (login de authController.js) responde con un objeto que contiene el token
        // si las credenciales son correctas, se almacena dicho token en el localStore. Es necesario
        // almacenar dicho token en el localStore, ya que el contexto AuthContext comprueba
        // dicho token (authState.status) para verificar si el usuario esta authenticado o no.
        // Ya que las rutas protegidas solo se acceden si el Contenido de authState.status es "authenticated"

        const email = data?.userData.email;
        const picture = data?.userData.picture;

        localStorage.setItem("token", data.token);
        setAuthState({ status: "authenticated", user: { username, email, picture }, token: data.token });
        return true; // Indicar que el alta del usuario fue exitoso
      } else {
        console.log("Token no proporcionado, revisa el controlador del servidor");
        throw new Error("Token no proporcionado");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setAuthState({ status: "error", user: null, token: null });
      return false; // Indicar que el alta del usuario falló
    }
  };

  // Pasar el estado de autenticación y las acciones a los consumidores
  console.log("Contenido de authState: " + JSON.stringify(authState));
  return (
    <AuthContext.Provider value={{ authState, login, signup, verifyToken, logout }}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
