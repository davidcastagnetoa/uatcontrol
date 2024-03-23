// ProtectedRoute.js
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

// Componente de Ruta Protegida y Redirección
function ProtectedRoute({ children, redirectTo = "/login" }) {
  const { authState } = useContext(AuthContext); // Aquí se deconstruye `authState` del valor del contexto.

  if (!authState) {
    // Ahora solo necesitas verificar si authState no está definido.
    console.log("authState es undefined");
    return <div>Loading...</div>;
  }

  console.log(authState); // Imprime el estado de autenticación en la consola

  if (authState.status === "pending") {
    return <div>Loading...</div>;
  }

  const isAuthenticated = authState.status === "authenticated";

  // Lógica de redirección
  if (redirectTo === "/") {
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
  }

  return isAuthenticated ? children : <Navigate to={redirectTo} replace />;
}

export default ProtectedRoute;
