// import React, { useCallback, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Button } from "./ui/button";
// import { Icons } from "./icons";
// import { FaMicrosoft } from "react-icons/fa";
// import { PublicClientApplication, loginWithDeviceCode } from "@azure/msal-browser";

// // Asumiendo que las funciones generateCodeVerifier y generateCodeChallenge ya están definidas
// import { generateCodeVerifier, generateCodeChallenge } from "../utils/pkce";

// const MS_CLIENT_ID = process.env.REACT_APP_MICROSOFT_APP_CLIENT_ID;
// const MS_TENANT_ID = process.env.REACT_APP_MICROSOFT_APP_TENANT_ID;

// // Configuración MSAL
// const msalConfig = {
//   auth: {
//     clientId: MS_CLIENT_ID,
//     authority: `https://login.microsoftonline.com/${MS_TENANT_ID}/oauth2/authorize`,
//     redirectUri: window.location.origin + "/redirect/microsoft",
//   },
// };

// const msalInstance = await PublicClientApplication.createPublicClientApplication(msalConfig);

// export function MicrosoftLogin({ isLoading }) {
//   const navigate = useNavigate();

//   useEffect(() => {
//     // Maneja la respuesta de redirección
//     msalInstance
//       .handleRedirectPromise()
//       .then((authResponse) => {
//         if (authResponse) {
//           // Aquí manejas la autenticación exitosa, por ejemplo, guardando el token
//           // y redirigiendo al usuario a otra página
//           console.log("Autenticación exitosa con Microsoft, account:", authResponse);
//         }
//       })
//       .catch(console.error);
//   }, []);

//   const login = async () => {
//     const codeVerifier = await generateCodeVerifier();
//     const codeChallenge = await generateCodeChallenge(codeVerifier);
//     console.warn("CodeVerifier que se crea:", codeVerifier);
//     console.warn("code_challenge que se genera:", codeChallenge);

//     localStorage.setItem("msalCodeVerifier", codeVerifier);

//     const loginRequest = {
//       scopes: ["User.Read"],
//       prompt: "select_account",
//       code_challenge: codeChallenge,
//       codeChallengeMethod: "S256",
//     };

//     console.log("Iniciando sesión en Microsoft...");
//     console.log("Valores de loginRequest enviados en la solicitud de autorización: ", loginRequest);

//     // Inicia el proceso de login
//     msalInstance.loginRedirect(loginRequest).catch(console.error);
//   };

//   return (
//     <Button className="w-full" variant="outline" type="button" onClick={login} disabled={isLoading}>
//       {isLoading ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : <FaMicrosoft className="mr-2 h-4 w-4" />}{" "}
//       Microsoft
//     </Button>
//   );
// }

// MicrosoftLogin.js
import React from "react";
import { useMsal } from "@azure/msal-react";
import { Button } from "./ui/button";
import { FaMicrosoft } from "react-icons/fa";

export const MicrosoftLogin = ({ isLoading }) => {
  const { instance } = useMsal();
  console.log("Valor de instance en MicrosoftLogin: ", JSON.stringify(instance));

  const handleLogin = () => {
    instance.loginRedirect();
  };

  return (
    <Button className="w-full" variant="outline" type="button" onClick={handleLogin} disabled={isLoading}>
      {isLoading ? "Cargando..." : <FaMicrosoft className="mr-2 h-4 w-4" />}
      Microsoft
    </Button>
  );
};
