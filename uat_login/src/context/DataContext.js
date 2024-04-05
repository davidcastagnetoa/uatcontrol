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
      console.log("UATs obtenidas: ", data.userUAT);
      return data.userUAT; // Devuelve el arreglo de UATs.
    } catch (error) {
      // Maneja cualquier error que ocurra en la solicitud o en la respuesta.
      console.error("Error al obtener todos los UATs: ", error);
      throw error; // Puede lanzar el error para manejarlo más arriba en la cadena de promesas o manejarlo aquí.
    }
  };

  // EN DESARROLLO
  const deleteUAT = async (uatLink, uatScript, uatOSA) => {
    console.log("Eliminando UAT");
  };

  return <DataContext.Provider value={{ saveUAT, getAllUATs }}>{children}</DataContext.Provider>;
};
