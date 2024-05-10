// DataContext.js
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import AuthContext from "./AuthContext";

// - ESTE CONTEXTO SE ENCARGA DE GUARDAR Y OBTENER DATOS DE UATS EN LA BASE DE DATOS
// - Crear el contexto DataContext y exportarlo para que pueda ser utilizado en cualquier componente

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { authState } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);

  // * Guarda nueva UAT en DB y responde con un ok
  const saveUAT = async (uatLink, uatScript, uatOSA, uatStatus) => {
    try {
      if (authState.status !== "authenticated") {
        throw new Error("Usuario no autenticado");
      }

      const response = await fetch("http://localhost:8080/api/save_uat_data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authState.token}`,
        },
        body: JSON.stringify({ uatLink, uatScript, uatOSA, uatStatus }),
      });

      if (!response.ok) {
        // Podemos capturar más detalles del error si la respuesta incluye un cuerpo
        const errorBody = await response.text();
        throw new Error(`Error al guardar los datos: ${errorBody}`);
      }

      console.log("Respuesta del servidor al guardar UAT: ", response);
      return true; // Si response.ok es true, entonces la operación fue exitosa
    } catch (error) {
      // Aquí manejamos cualquier error que haya sido lanzado en el bloque try
      console.error("Ha ocurrido un error en saveUAT: ", error.message);
      return false; // Indicar que la operación no fue exitosa
    }
  };

  // * Obtiene todos los UATs de la base de datos y los devuelve en un arreglo.
  const getAllUATs = async () => {
    console.log("Obteniendo todos los UATs");
    try {
      if (authState.status !== "authenticated") {
        throw new Error("Usuario no autenticado");
      }

      const response = await fetch("http://localhost:8080/api/get_uat_data", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authState.token}`,
        },
      });

      console.warn("Respuesta del servidor al obtener UATs: ", response);

      if (!response.ok) {
        // Si la respuesta no es satisfactoria, lanza un error.
        const errorBody = await response.text();
        throw new Error(`Error al obtener los datos: ${errorBody}`);
      }

      // Si la respuesta es satisfactoria, procesa y devuelve los datos.
      const data = await response.json();
      console.log("UATs obtenidas del servidor: ", data.userUAT);
      return data.userUAT; // Devuelve el arreglo de UATs.
    } catch (error) {
      // Maneja cualquier error que ocurra en la solicitud o en la respuesta.
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

      const response = await fetch("http://localhost:8080/api/delete_uat_data", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authState.token}`,
        },
        body: JSON.stringify({ uatLink, uatScript, uatOSA }),
      });

      if (!response.ok) {
        // Podemos capturar más detalles del error si la respuesta incluye un cuerpo
        const errorBody = await response.text();
        throw new Error(`Error al guardar los datos: ${errorBody}`);
      }

      console.log("Respuesta del servidor al eliminar la UAT: ", response);
      return true; // Si response.ok es true, entonces la operación fue exitosa
    } catch (error) {
      // Aquí manejamos cualquier error que haya sido lanzado en el bloque try
      console.error("Ha ocurrido un error en removeUAT: ", error.message);
      return false; // Indicar que la operación no fue exitosa
    }
  };

  // * Obtiene las estadiscticas de las UATs de la base de datos y los devuelve en un arreglo.
  const getUATstadistics = async () => {
    console.log("Obteniendo estadisticas de las UATs");
    try {
      if (authState.status !== "authenticated") {
        throw new Error("Usuario no autenticado");
      }
      const response = await fetch("http://localhost:8080/api/stadistics", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authState.token}`,
        },
      });

      console.warn("Estadisticas de las UATs: ", response);

      if (!response.ok) {
        // Si la respuesta no es satisfactoria, lanza un error.
        const errorBody = await response.text();
        throw new Error(`Error al obtener los datos: ${errorBody}`);
      }

      // Si la respuesta es satisfactoria, procesa y devuelve los datos.
      const data = await response.json();
      console.log("Estadisticas UATs: ", data.data);
      return data.data; // Devuelve el arreglo de UATs Stadistics
    } catch (error) {
      // Maneja cualquier error que ocurra en la solicitud o en la respuesta.
      console.error("Error al obtener las estadisticas de las UATs: ", error);
      throw error;
    }
  };

  // * Obtiene los datos de perfil del usuario logado
  const getUserData = async () => {
    console.log("Obteniendo datos del usuario");

    if (authState.status !== "authenticated") {
      throw new Error("Usuario no autenticado");
    }

    try {
      const response = await fetch("http://localhost:8080/api/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authState.token}`,
        },
      });

      console.warn("Respuesta del servidor los datos del usuario: ", response);

      if (!response.ok) {
        // Si la respuesta no es satisfactoria, lanza un error.
        const errorBody = await response.text();
        throw new Error(`Error al obtener los datos: ${errorBody}`);
      }

      // Si la respuesta es satisfactoria, procesa y devuelve los datos.
      const userData = await response.json();
      console.log("Datos de Usuario: ", userData);
      return userData; // Devuelve el objeto
    } catch (err) {
      // Maneja cualquier error que ocurra en la solicitud o en la respuesta.
      // console.error("getUserData, Error al obtener los datos del usuario: ", err);
      throw err;
    }
  };

  // * Obtiene el listado de todos los usuarios de la DB, solo para usuarios con privilegios de administrador
  const getAllUsers = async () => {
    console.log("Obteniendo Listado de usuarios");

    if (authState.status !== "authenticated") {
      throw new Error("Usuario no autenticado");
    }
    try {
      const response = await fetch("http://localhost:8080/api/user_lists", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authState.token}`,
        },
      });

      console.warn("Respuesta del servidor los datos del usuario: ", response);

      if (!response.ok) {
        // Maneja la respuesta no satisfactoria según el código de estado HTTP
        const errorBody = await response.text();

        // Específicamente para un código 403
        if (response.status === 403) {
          console.error("Acceso denegado. No tienes privilegios de administrador.");
          throw new Error("Acceso denegado. No tienes privilegios de administrador.");
        }

        // Para otros códigos de error
        throw new Error(`Error al obtener los datos: ${errorBody}`);
      }

      // Si la respuesta es satisfactoria, procesa y devuelve los datos.
      const data = await response.json();
      console.log("Datos de Usuario obtenidos: ", data.userRows);
      return data.userRows;
    } catch (err) {
      // Maneja cualquier error que ocurra en la solicitud o en la respuesta.
      // console.error("getAllUsers, Error al obtener los datos del usuario: ", err);
      throw err;
    }
  };

  // * Función para actualizar el estado de usuario
  const updateUserData = useCallback(async () => {
    if (authState.status !== "authenticated") {
      throw new Error("Usuario no autenticado");
    }
    try {
      const response = await fetch("http://localhost:8080/api/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authState.token}`,
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Error al obtener los datos: ${errorBody}`);
      }

      const data = await response.json();
      setUserData(data); // Actualiza el estado global del usuario
      console.log("Datos de Usuario obtenidos y actualizados: ", data);
    } catch (error) {
      console.error("Error al obtener los datos del usuario:", error);
    }
  }, [authState]);

  useEffect(() => {
    if (authState.status === "authenticated") {
      updateUserData();
    }
  }, [authState.status, updateUserData]);

  // * Actualiza los datos del usuario logado
  const upgradeUserData = async (username, matricula, privilegio) => {
    console.log("Actualizando datos del usuario");

    if (authState.status !== "authenticated") {
      throw new Error("Usuario no autenticado");
    }
    console.log("upgradeUserData - Datos del usuario: ", username, matricula, privilegio);

    try {
      const response = await fetch("http://localhost:8080/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authState.token}`,
        },
        body: JSON.stringify({ username, matricula, privilegio }),
      });

      console.warn("Respuesta del servidor los datos del usuario: ", response);

      if (!response.ok) {
        const errorBody = await response.text();

        if (response.status === 403) {
          console.error("Acceso denegado. No tienes privilegios de administrador.");
          throw new Error("Acceso denegado. No tienes privilegios de administrador.");
        }
        if (response.status === 409) {
          console.error("El nombre de usuario ya está en uso. Elige otro nombre de usuario");
          throw new Error("El nombre de usuario ya está en uso. Elige otro nombre de usuario.");
        }

        throw new Error(`Error en el servidor, revisa el controlador: ${errorBody}`);
      }
      const data = await response.json();
      setUserData(data.userData); // Actualiza el estado con los datos recibidos
      console.log("Datos de Usuario actualizados: ", data.userData);
      return data.userData; // Actualiza el estado del cliente con los datos recibidos
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

    try {
      const response = await fetch("http://localhost:8080/api/deleteUser", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authState.token}`,
        },
        body: JSON.stringify({ emailUserTarget }),
      });

      if (!response.ok) {
        const errorBody = await response.text();

        if (response.status === 400) {
          console.error("No puedes eliminarte a ti mismo");
          throw new Error("No puedes eliminarte a ti mismo");
        }

        throw new Error(`Error al eliminar el usuario: ${errorBody}`);
      }
      const data = await response.json();
      setUserData(data.userData);
      console.log("Usuario eliminado, datos recibidos:", data.userData);
      return data.userData;
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
