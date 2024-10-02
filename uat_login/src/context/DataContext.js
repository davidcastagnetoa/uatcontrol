// DataContext.js
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import AuthContext from "./AuthContext";

// - ESTE CONTEXTO SE ENCARGA DE GUARDAR Y OBTENER DATOS DE UATS EN LA BASE DE DATOS
// - Crear el contexto DataContext y exportarlo para que pueda ser utilizado en cualquier componente

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { authState } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);

  // - Función para renovar el token de acceso
  async function refreshTokenAndRetryRequest(url, options, originalRequestBody) {
    try {
      console.log("Refrescando token");
      const refreshResponse = await fetch("http://localhost:8080/api/refresh_token", {
        method: "POST",
        credentials: "include", //! Necesario para incluir cookies
      });

      if (!refreshResponse.ok) throw new Error("Unable to refresh token");

      const { token: newToken } = await refreshResponse.json();

      // - Actualizar el estado con el nuevo token
      authState.token = newToken;

      //! Si la solicitud original necesita un cuerpo, lo incluiye nuevamente
      if (originalRequestBody) {
        options.body = JSON.stringify(originalRequestBody);
      }

      options.headers.Authorization = `Bearer ${newToken}`;

      const retryResponse = await fetch(url, options);
      if (!retryResponse.ok) throw new Error("Request failed after token refresh");
      return retryResponse;
    } catch (error) {
      console.log("Error al refrescar el token: ", error.message);
      throw error;
    }
  }

  // * Guarda nueva UAT en DB y responde con un ok
  const saveUAT = async (uatLink, uatScript, uatOSA, uatStatus) => {
    if (authState.status !== "authenticated") {
      throw new Error("Usuario no autenticado");
    }

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authState.token}|${authState.refreshToken}`,
      },
      body: JSON.stringify({ uatLink, uatScript, uatOSA, uatStatus }),
    };

    let response = await fetch("http://localhost:8080/api/save_uat_data", requestOptions);

    //! Si la respuesta no es satisfactoria, intenta renovar el token de acceso y reintentar la solicitud
    console.log("Intentando refrescar el token y reintentar la solicitud");
    if (!response.ok && (response.status === 401 || response.status === 403)) {
      console.warn("Intentando refrescar el token y reintentar la solicitud");
      response = await refreshTokenAndRetryRequest("http://localhost:8080/api/save_uat_data", requestOptions, {
        uatLink,
        uatScript,
        uatOSA,
        uatStatus,
      });
    }

    console.log("Respuesta del servidor al guardar UAT: ", response);
    return true;
  };

  // - Funcion para solicitar una UAT específica a través del proxy del servidor y navegar a el
  const fetchUATProxy = async (uatId) => {
    console.log("Solicitando UAT a través de proxy");

    if (authState.status !== "authenticated") {
      throw new Error("Usuario no autenticado");
    }

    let requestOptions = {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authState.token}|${authState.refreshToken}`,
      },
    };

    try {
      let response = await fetch(`http://localhost:8080/api/proxy?uatId=${uatId}`, requestOptions);

      //! Si la respuesta no es satisfactoria, intenta renovar el token de acceso y reintentar la solicitud
      if (!response.ok && (response.status === 401 || response.status === 403)) {
        console.warn("Intentando refrescar el token y reintentar la solicitud");
        response = await refreshTokenAndRetryRequest(`http://localhost:8080/api/proxy?uatId=${uatId}`, requestOptions);
      }

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Error al acceder a la UAT: ${errorBody}`);
        throw new Error(`Error al acceder a la UAT: ${errorBody}`);
      }

      // * Si la respuesta es satisfactoria, obtiene la URL de la UAT
      const uatUrl = await response.json();
      console.log("UAT accedida correctamente, URL: ", uatUrl?.url);
      return uatUrl?.url;
    } catch (error) {
      console.error("Error al solicitar la UAT a través del proxy: ", error.message);
      throw error;
    }
  };

  // * Obtiene todos los UATs de la base de datos y los devuelve en un arreglo.
  const getAllUATs = async () => {
    console.log("Obteniendo todos los UATs");
    try {
      if (authState.status !== "authenticated") {
        throw new Error("Usuario no autenticado");
      }

      let requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authState.token}|${authState.refreshToken}`,
        },
      };

      let response = await fetch("http://localhost:8080/api/get_uat_data", requestOptions);

      //! Si la respuesta no es satisfactoria, intenta renovar el token de acceso y reintentar la solicitud
      console.log("Intentando refrescar el token y reintentar la solicitud");
      if (!response.ok && (response.status === 401 || response.status === 403)) {
        console.warn("Intentando refrescar el token y reintentar la solicitud");
        response = await refreshTokenAndRetryRequest("http://localhost:8080/api/get_uat_data", requestOptions);
        console.log("Respuesta del servidor al obtener UATs: ", response);
      }

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Error al obtener los datos: ${errorBody}`);
      }

      const data = await response.json();
      console.log("UATs obtenidas del servidor: ", data.userUAT);
      return data.userUAT; //! Devuelve el arreglo de UATs.
    } catch (error) {
      console.error("Error al obtener todos los UATs: ", error);
      throw error;
    }
  };

  // * Elimina una UAT de la base de datos y responde con un ok
  const removeUAT = async (uatScript, uatLink, uatOSA) => {
    console.log("Eliminando UAT");

    try {
      if (authState.status !== "authenticated") {
        throw new Error("Usuario no autenticado");
      }

      const requestOptions = {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authState.token}|${authState.refreshToken}`,
        },
        body: JSON.stringify({ uatLink, uatScript, uatOSA }),
      };

      let response = await fetch("http://localhost:8080/api/delete_uat_data", requestOptions);

      //! Si la respuesta no es satisfactoria, intenta renovar el token de acceso y reintentar la solicitud
      if (!response.ok && (response.status === 401 || response.status === 403)) {
        console.warn("Intentando refrescar el token y reintentar la solicitud");
        response = await refreshTokenAndRetryRequest("http://localhost:8080/api/delete_uat_data", requestOptions, {
          uatLink,
          uatScript,
          uatOSA,
        });
      }

      if (!response.ok) {
        // Captura más detalles del error si la respuesta aún incluye un cuerpo
        const errorBody = await response.text();
        throw new Error(`Error al eliminar los datos: ${errorBody}`);
      }

      console.log("Respuesta del servidor al eliminar la UAT: ", response);
      return true; // Si response.ok es true, entonces la operación fue exitosa
    } catch (error) {
      console.error("Ha ocurrido un error en removeUAT: ", error.message);
      return false; // Indicar que la operación no fue exitosa
    }
  };

  // * Obtiene las estadísticas de las UATs de la base de datos y los devuelve en un arreglo.
  const getUATstadistics = async () => {
    console.log("Obteniendo estadísticas de las UATs");
    try {
      if (authState.status !== "authenticated") {
        throw new Error("Usuario no autenticado");
      }

      let requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authState.token}|${authState.refreshToken}`,
        },
      };

      let response = await fetch("http://localhost:8080/api/stadistics", requestOptions);

      //! Si la respuesta no es satisfactoria, intenta renovar el token de acceso y reintentar la solicitud
      if (!response.ok && (response.status === 401 || response.status === 403)) {
        console.warn("Intentando refrescar el token y reintentar la solicitud");
        response = await refreshTokenAndRetryRequest("http://localhost:8080/api/stadistics", requestOptions);
        console.log("Respuesta del servidor al obtener las estadísticas: ", response);
      }

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Error al obtener los datos: ${errorBody}`);
      }

      const data = await response.json();
      console.log("Estadísticas UATs: ", data.data);
      return data.data; //! Devuelve el arreglo de estadísticas de UATs.
    } catch (error) {
      console.error("Error al obtener las estadísticas de las UATs: ", error);
      throw error;
    }
  };

  // * Obtiene el listado de todos los usuarios de la DB, solo para usuarios con privilegios de administrador
  const getAllUsers = async () => {
    console.log("Obteniendo Listado de usuarios");

    if (authState.status !== "authenticated") {
      throw new Error("Usuario no autenticado");
    }

    let requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authState.token}|${authState.refreshToken}`,
      },
    };

    try {
      let response = await fetch("http://localhost:8080/api/user_lists", requestOptions);

      //! Si la respuesta no es satisfactoria, intenta renovar el token de acceso y reintentar la solicitud
      if (!response.ok && (response.status === 401 || response.status === 403)) {
        console.warn("Intentando refrescar el token y reintentar la solicitud");
        response = await refreshTokenAndRetryRequest("http://localhost:8080/api/user_lists", requestOptions);
        console.log("Respuesta del servidor al obtener las estadísticas: ", response);
      }

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Error al obtener los datos de todos los usuarios: ${errorBody}`);
        console.error("Acceso denegado. No tienes privilegios de administrador.");
        throw new Error("Acceso denegado. No tienes privilegios de administrador.");
      }

      const data = await response.json();
      console.log("Datos de Usuario obtenidos: ", data.userRows);
      return data.userRows;
    } catch (error) {
      console.error("Error al obtener los datos del usuario: ", error);
      throw error;
    }
  };

  // * Solicta los datos de perfil del usuario logado al servidor
  const fetchUserData = async (handleData) => {
    console.log("Obteniendo datos del usuario");

    if (authState.status !== "authenticated") {
      throw new Error("Usuario no autenticado");
    }

    let requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authState.token}|${authState.refreshToken}`,
      },
    };

    try {
      let response = await fetch("http://localhost:8080/api/profile", requestOptions);

      //! Si la respuesta no es satisfactoria, intenta renovar el token de acceso y reintentar la solicitud
      if (!response.ok && (response.status === 401 || response.status === 403)) {
        console.warn("Intentando refrescar el token y reintentar la solicitud");
        response = await refreshTokenAndRetryRequest("http://localhost:8080/api/profile", requestOptions);
        console.log("Respuesta del servidor al obtener las estadísticas: ", response);
      }

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Error al obtener los datos: ${errorBody}`);
      }

      const userData = await response.json();
      console.log("::: Datos de Usuario obtenidos del servidor: ", userData);

      // Handle data with callback
      handleData(userData);

      return userData; // Devuelve el objeto
    } catch (error) {
      console.error("Error al obtener los datos del usuario: ", error);
      throw error;
    }
  };

  // * Obtiene los datos de perfil del usuario logado
  const getUserData = async () => {
    return fetchUserData((userData) => {
      console.log("Datos de Usuario obtenidos en getUserData, contexto DataContext.js: ", userData);
    });
  };

  // * Actualiza los datos del usuario logado en el cliente
  const updateUserData = useCallback(() => {
    fetchUserData((data) => {
      setUserData(data); //! Actualiza el estado global del usuario
      console.log("Datos de Usuario obtenidos y actualizados: ", data);
    });
  }, [authState]);

  // * Actualiza y compriueba los datos del usuario logado en el contexto
  useEffect(() => {
    if (authState.status === "authenticated") {
      updateUserData();
    }
  }, [authState.status, updateUserData]);

  // * Actualiza los datos del usuario logado en la base de datos
  const upgradeUserData = async (username, matricula, privilegio) => {
    console.log("Actualizando datos del usuario");

    if (authState.status !== "authenticated") {
      throw new Error("Usuario no autenticado");
    }
    console.log("upgradeUserData - Datos del usuario: ", username, matricula, privilegio);

    let requestOptions = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authState.token}|${authState.refreshToken}`,
      },
      body: JSON.stringify({ username, matricula, privilegio }),
    };

    try {
      let response = await fetch("http://localhost:8080/api/profile", requestOptions);

      //! Si la respuesta no es satisfactoria, intenta renovar el token de acceso y reintentar la solicitud
      if (!response.ok && (response.status === 401 || response.status === 403)) {
        console.warn("Intentando refrescar el token y reintentar la solicitud");
        response = await refreshTokenAndRetryRequest("http://localhost:8080/api/profile", requestOptions);
        console.log("Respuesta del servidor al obtener las estadísticas: ", response);
      }
      if (!response.ok) {
        const errorBody = await response.text();

        if (response.status === 409) {
          console.error("El nombre de usuario ya está en uso. Elige otro nombre de usuario");
          throw new Error("El nombre de usuario ya está en uso. Elige otro nombre de usuario.");
        }

        throw new Error(`Error en el servidor, revisa el controlador: ${errorBody}`);
      }

      const data = await response.json();
      setUserData(data.userData); //! Actualiza el estado con los datos recibidos
      console.log("Datos de Usuario actualizados: ", data.userData);
      return data.userData; //* Actualiza el estado del cliente con los datos recibidos
    } catch (error) {
      console.error("Error al Actualizar el usuario", error.message);
      throw error;
    }
  };

  // * Elimina al usuario de la base de datos, Solo disponible para administradores
  const removeUser = async (emailUserTarget) => {
    console.log("Eliminando usuario");

    if (authState.status !== "authenticated") {
      throw new Error("Usuario no autenticado");
    }

    let requestOptions = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authState.token}|${authState.refreshToken}`,
      },
      body: JSON.stringify({ emailUserTarget }),
    };

    try {
      let response = await fetch("http://localhost:8080/api/deleteUser", requestOptions);

      //! Si la respuesta no es satisfactoria, intenta renovar el token de acceso y reintentar la solicitud
      if (!response.ok && (response.status === 401 || response.status === 403)) {
        console.warn("Intentando refrescar el token y reintentar la solicitud");
        response = await refreshTokenAndRetryRequest("http://localhost:8080/api/deleteUser", requestOptions);
        console.log("Respuesta del servidor al obtener las estadísticas: ", response);
      }

      if (!response.ok) {
        const errorBody = await response.text();

        if (response.status === 400) {
          console.error("No puedes eliminarte a ti mismo");
          throw new Error("No puedes eliminarte a ti mismo");
        }

        throw new Error(`Error al eliminar el usuario: ${errorBody}`);
      }

      const data = await response.json();
      console.log("Usuario eliminado, datos recibidos:", data.userData);
      return data.userData; //! Devuelve el estado del cliente con los datos recibidos
    } catch (error) {
      console.error("Error al eliminar el usuario", error.message);
      throw error;
    }
  };

  return (
    <DataContext.Provider
      value={{
        saveUAT,
        getAllUATs,
        fetchUATProxy,
        getUATstadistics,
        removeUAT,
        getUserData,
        getAllUsers,
        upgradeUserData,
        userData,
        removeUser,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
