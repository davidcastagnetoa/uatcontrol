// DataContext.js
import React, { createContext, useContext } from "react";
import AuthContext from "./AuthContext";

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { authState } = useContext(AuthContext);

  const save = async (uatLink, uatScript) => {
    if (authState.status !== "authenticated") {
      throw new Error("Usuario no autenticado");
    }
    const response = await fetch("http://localhost:8080/api/save-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authState.token}`, // asumiendo que tienes un token JWT
      },
      body: JSON.stringify({ uatLink, uatScript }),
    });
    if (!response.ok) {
      throw new Error("Error al guardar los datos. ");
    }
    return response.json();
  };

  return <DataContext.Provider value={{ save }}>{children}</DataContext.Provider>;
};
