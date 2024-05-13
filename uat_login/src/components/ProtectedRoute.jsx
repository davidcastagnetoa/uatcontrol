// ProtectedRoute.js
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

// * Componente de Ruta Protegida y Redirección
function ProtectedRoute({ children, redirectTo = "/login" }) {
  const { authState } = useContext(AuthContext); // Aquí se deconstruye `authState` del valor del contexto.
  console.warn("Valores de authState:", authState);

  // ! Ahora solo necesitas verificar si authState no está definido.
  if (!authState) {
    console.log("authState es undefined");
    return <div>Loading...</div>;
  }

  console.log(authState);

  if (authState.status === "pending") {
    return <div>Loading...</div>;
  }

  console.log("El estado de authState: ", authState.status);
  const isAuthenticated = authState.status === "authenticated";

  // - Lógica de redirección
  if (redirectTo === "/") {
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
  }

  return isAuthenticated ? children : <Navigate to={redirectTo} replace />;
}

export default ProtectedRoute;
