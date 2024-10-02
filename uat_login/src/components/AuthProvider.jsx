// AuthProvider.js
import React, { useEffect, useState } from "react";
import AuthContext from "../context/AuthContext";

// -  ESTE CONTEXTO SE ENCARGA DE GESTIONAR LA AUTENTICACIÓN DEL USUARIO

const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: null,
    refreshToken: null,
    // status: "unauthenticated",
    status: "pending",
    user: null,
  });

  // * Función de login comprueba en el servidor, usuario y contraseña, si los datos son correctos
  // * se trae el token que genera el servidor y devuelve el true que necesita
  const login = async (username, password) => {
    console.log("Iniciando sesión,  usuario: ", username);
    try {
      // - Realizar una petición al servidor para iniciar sesión
      console.log("Llamando a endpoint http://localhost:8080/api/login");
      const response = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*", //AÑADIDO
          Accept: "*/*", //AÑADIDO
        },
        body: JSON.stringify({ username, password }),
      });

      console.warn("Respuesta recibida del servidor al intentar iniciar sesión: ", response);

      //! Si el servidor responde con un código de error, manejarlo aquí
      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor");
      }
      const data = await response.json();
      console.warn("Dato recibido del servidor: ", data);

      if (data.token && data.refreshToken) {
        // - Como el servidor (login de authController.js) responde con un objeto que contiene el token,  si las credenciales
        // - son correctas, se almacena dicho token en el localStore. Es necesario almacenar dicho token en el localStore, (en cookies en proximas versiones)
        // - ya que el contexto AuthContext comprueba dicho token (authState.status) para verificar si el usuario está
        // - authenticado o no. Ya que las rutas protegidas solo se acceden si el Contenido de authState.status es  "authenticated"

        const email = data?.userData.email;
        const picture = data?.userData.picture;

        localStorage.setItem("token", data.token);
        localStorage.setItem("refreshToken", data.refreshToken);
        setAuthState({
          status: "authenticated",
          user: { username, email, picture },
          token: data.token,
          refreshToken: data.refreshToken,
        });
        return true; // * Indicar que el inicio de sesión fue exitoso
      } else {
        console.log("Token no proporcionado");
        throw new Error("Token no proporcionado");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setAuthState({ status: "error", user: null, token: null });
      return false; //! Indicar que el inicio de sesión falló
    }
  };

  // * Funcion de signup para dar de alta a un nuevo usuario
  const signup = async (username, email, matricula, password) => {
    console.log("Creando a nuevo usuario: ", username);

    try {
      console.log("Llamando a endpoint http://localhost:8080/api/signup");
      const response = await fetch("http://localhost:8080/api/signup", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Accept: "*/*",
        },
        body: JSON.stringify({ username, email, matricula, password }),
      });

      console.warn("Respuesta recibida del servidor al intentar iniciar sesión: ", response);

      //! Si el servidor responde con un código de error, se lanza error
      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor, verifica los argumentos del controlador, o el cliente");
      }

      const data = await response.json();
      console.warn("Dato recibido del servidor: ", data);

      if (data.token && data.refreshToken) {
        // - Como el servidor (login de authController.js) responde con un objeto que contiene el token si las credenciales son correctas,
        // - se almacena dicho token en el localStore. Es necesario almacenar dicho token en el localStore, ya que el contexto AuthContext
        // - comprueba dicho token (authState.status) para verificar si el usuario esta authenticado o no.  Ya que las rutas protegidas solo
        // - se acceden si el Contenido de authState.status es "authenticated"

        const email = data?.userData.email;
        const picture = data?.userData.picture;

        localStorage.setItem("token", data.token);
        localStorage.setItem("refreshToken", data.refreshToken);
        setAuthState({
          status: "authenticated",
          user: { username, email, picture },
          token: data.token,
          refreshToken: data.refreshToken,
        });
        return true; //* Indicar que el alta del usuario fue exitoso
      } else {
        console.log("Token no proporcionado, revisa el controlador del servidor");
        throw new Error("Token no proporcionado");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setAuthState({ status: "error", user: null, token: null });
      return false; //! Indicar que el alta del usuario falló
    }
  };

  // * Implementar lógica para verificar autenticación aquí (e.g., verificar token local)
  const verifyToken = async () => {
    console.debug("Verificando token...");
    try {
      const token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!token) {
        throw new Error("No token found");
      }

      console.log("Token encontrado: ", token);
      console.log("Llamando a endpoint http://localhost:8080/api/verifyToken ...");
      console.log("Controlador verifyTokenController");

      // - Función auxiliar para intentar verificar un token dado
      const tryVerifyToken = async (tokenToVerify) => {
        const response = await fetch("http://localhost:8080/api/verifyToken", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenToVerify}`,
            "Access-Control-Allow-Origin": "*",
            Accept: "*/*",
          },
        });

        console.warn(
          "Respuesta recibida al verificar el token en el servidor, funcion verifyTokenController(): ",
          response
        );
        if (!response.ok) {
          throw new Error("Error en la verificación del token");
        }

        const data = await response.json();
        console.log("..:: Respuesta del servidor: ", data);

        if (data.valid) {
          localStorage.setItem("token", data.token); // Asumiendo que se recibe un nuevo token

          setAuthState({
            status: "authenticated",
            token: data.token,
            refreshToken,
            user: {
              username: data.username,
              email: data.email,
              picture: data.picture,
            },
          });
          return true;
        } else {
          throw new Error("Token no válido");
        }
      };

      // * Intenta con el token de acceso primero
      try {
        return await tryVerifyToken(token);
      } catch (error) {
        console.error("Error con el token de acceso, intentando con el token de refresco: " + error);

        // * Intenta con el token de refresco si el token de acceso falla
        if (refreshToken) {
          console.log("Token de refresco encontrado...", refreshToken);
          return await tryVerifyToken(refreshToken);
        } else {
          throw new Error("No refresh token found");
        }
      }
    } catch (error) {
      console.error("Error al verificar los tokens: " + error.toString());
      setAuthState({ status: "anonymous", token: null, refreshToken: null });
      return false;
    }
  };

  // * Función de logout actualizada para limpiar los tokens
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setAuthState({ status: "anonymous", token: null, refreshToken: null });
    window.location.href = "/login";
  };

  // * Efecto para verificar el token al cargar la aplicación
  useEffect(() => {
    verifyToken();
  }, []);

  // * Pasar el estado de autenticación y las acciones a los consumidores
  console.debug("Contenido de authState: " + JSON.stringify(authState));
  return (
    <AuthContext.Provider value={{ authState, setAuthState, login, signup, verifyToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
