// DataContext.js
import React, { createContext, useContext } from "react";
import AuthContext from "./AuthContext";

// ESTE CONTEXTO SE ENCARGA DE GUARDAR Y OBTENER DATOS DE UATS EN LA BASE DE DATOS
// Crear el contexto DataContext y exportarlo para que pueda ser utilizado en cualquier componente

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { authState } = useContext(AuthContext);

  // Guarda nueva UAT en DB y responde con un ok
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

  // Obtiene todos los UATs de la base de datos y los devuelve en un arreglo.
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

  // Elimina una UAT de la base de datos y responde con un ok
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

  // Obtiene las estadiscticas de las UATs de la base de datos y los devuelve en un arreglo.
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

  // Obtiene los datos de perfil del usuario logado
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

  // EN DESARROLLO
  // Obtiene el listado de todos los usuarios de la DB, solo para usuarios con privilegios de administrador
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
      return data.userRows; // Devuelve el arreglo de UATs.
    } catch (err) {
      // Maneja cualquier error que ocurra en la solicitud o en la respuesta.
      // console.error("getAllUsers, Error al obtener los datos del usuario: ", err);
      throw err;
    }
  };

  return (
    <DataContext.Provider
      value={{ saveUAT, getAllUATs, getUATstadistics, removeUAT, getUserData, getAllUsers }}
    >
      {children}
    </DataContext.Provider>
  );
};
