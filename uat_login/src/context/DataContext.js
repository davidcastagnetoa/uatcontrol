// DataContext.js
import React, { createContext, useContext } from "react";
import AuthContext from "./AuthContext";

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { authState } = useContext(AuthContext);

  const save = async (uatLink, uatScript, uatUsername) => {
    if (authState.status !== "authenticated") {
      throw new Error("Usuario no autenticado");
    }
    const response = await fetch("http://localhost:8080/api/save-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // asumiendo que tienes un token JWT
        Authorization: `Bearer ${authState.token}`,
      },
      // Aqui enviamos los datos de la UAT al servidor
      // para su tratamiento en el controlador userDataController
      body: JSON.stringify({ uatLink, uatScript, uatUsername }),
    });
    if (!response.ok) {
      throw new Error("Error al guardar los datos. ");
    }
    return response.json();
  };

  return <DataContext.Provider value={{ save }}>{children}</DataContext.Provider>;
};
