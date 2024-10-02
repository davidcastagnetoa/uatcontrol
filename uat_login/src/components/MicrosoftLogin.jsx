// // Configuración MSAL
// const msalConfig = {
//   auth: {
//     clientId: MS_CLIENT_ID,
//     authority: `https://login.microsoftonline.com/${MS_TENANT_ID}/oauth2/authorize`,
//     redirectUri: window.location.origin + "/redirect/microsoft",
//   },
// };

// MicrosoftLogin.js
import React, { useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { Button } from "./ui/button";
import { Icons } from "./icons";
import { FaMicrosoft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export const MicrosoftLogin = ({ isLoading }) => {
  const { instance } = useMsal();
  const navigate = useNavigate();

  useEffect(() => {
    instance
      .handleRedirectPromise()
      .then((tokenResponse) => {
        if (tokenResponse) {
          const accessToken = tokenResponse.accessToken; //MALO , no se envia al servidor
          console.log("Autenticación exitosa con Microsoft, accessToken:", accessToken);
          // onMicrosoftSuccess && onMicrosoftSuccess(accessToken);
          navigate("/redirect/microsoft"); // Redirige manualmente
        }
      })
      .catch((e) => {
        console.error("ERROR en MicrosoftLogin: ", e);
      });
  }, [navigate, instance]);

  const handleLogin = () => {
    const loginRequest = {
      scopes: ["User.Read", "email", "profile", "openid "],
      prompt: "consent",
    };
    instance.loginRedirect(loginRequest).catch(console.error);
  };

  return (
    <Button className="w-full" variant="outline" type="button" onClick={handleLogin} disabled={isLoading}>
      {isLoading ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : <FaMicrosoft className="mr-2 h-4 w-4" />}
      Microsoft
    </Button>
  );
};
