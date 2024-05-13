// MicrosoftAuthRedirect.jsx
import React, { useContext, useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

export const MicrosoftAuthRedirect = () => {
  const { login, verifyToken } = useContext(AuthContext);
  const { accounts, instance } = useMsal();
  const navigate = useNavigate();

  useEffect(() => {
    if (accounts.length > 0) {
      const account = accounts[0];
      instance
        .acquireTokenSilent({
          scopes: ["user.read", "email", "profile", "openid "],
          account: account,
        })
        .then((response) => {
          // Prepara los datos a enviar
          const requestBody = {
            authCode: response.accessToken,
          };

          // Imprime los datos que se enviarán en la consola
          console.log("Enviando datos al servidor:", requestBody);

          fetch("http://localhost:8080/api/auth/microsoft", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              Accept: "*/*",
            },
            body: JSON.stringify(requestBody),
          })
            .then((res) => res.json())
            .then(async (data) => {
              // Manejar la respuesta del servidor aquí
              console.log("Datos recibidos del servidor de la Aplicacion: ", data);
              let accessToken = data.accessToken;
              let refreshToken = data.refreshToken;

              console.debug("Access Token: ", accessToken);
              console.debug("Refresh Token: ", refreshToken);
              console.info("Login exitoso!");

              localStorage.setItem("token", accessToken);
              localStorage.setItem("refreshToken", refreshToken);

              const success = await verifyToken();

              if (success) {
                console.log("Redirigiendo a dashboard");
                navigate("/dashboard", { replace: true });
              } else {
                throw new Error("No se ha verificado el token en la funcion verifyToken() del contexto AuthProvider .");
              }
            });
        });
    }
    // Descomenta las siguientes líneas si necesitas verificar los valores de `accounts` y `instance`
    // console.warn("MicrosoftAuthRedirect.jsx accounts: ", JSON.stringify(accounts));
    // console.warn("MicrosoftAuthRedirect.jsx instance: ", JSON.stringify(instance));
  }, [accounts, instance, navigate]);

  return <div>Autenticando con Microsoft...</div>;
};
