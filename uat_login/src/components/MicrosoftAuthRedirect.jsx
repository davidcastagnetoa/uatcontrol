// // En algún componente de React que maneja la redirección después del login con Microsoft
// import React, { useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// function MicrosoftAuthRedirect() {
//   const navigate = useNavigate();

//   useEffect(() => {
//     // Extraer el código de la URL
//     const currentUrl = new URL(window.location.href.replace("#", "?"));

//     console.log("currentUrl: ", currentUrl.searchParams.get("code"));
//     const code = currentUrl.searchParams.get("code");
//     console.log("code: ", code);

//     if (code) {
//       const codeVerifier = localStorage.getItem("msalCodeVerifier");
//       console.debug("..:: CodeVerifier recuperado de localStorage que se envia al servidor: ", codeVerifier);
//       // Enviar el código al servidor para obtener el token
//       fetch("http://localhost:8080/api/auth/microsoft", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ code, codeVerifier }),
//       })
//         .then((response) => {
//           if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//           }
//           return response.json();
//         })
//         .then((data) => {
//           // Aquí manejas la respuesta del servidor, por ejemplo almacenar el token
//           console.info(data);
//           console.info("Token: ", data.token);
//           // console.info("User: ", data.user);
//           console.info("Login exitoso!");
//           localStorage.setItem("jwtToken", data.token);
//           // Rediriges al usuario al dashboard o a la página principal
//           // navigate("/dashboard");
//         })
//         .catch((e) => {
//           console.error("Hubo un problema con la operación fetch: " + e);
//           // navigate("/login"); // Rediriges al usuario a la página de login si algo falla
//         });
//     } else {
//       // No hay código, redirigir al login
//       console.error("No se ha encontrado el código de autenticación en la URL.");
//       // navigate("/login");
//     }
//   }, [navigate]);

//   // Puedes mostrar un mensaje de carga mientras se procesa la redirección
//   return <div>Autenticando con Microsoft...</div>;
// }

// export default MicrosoftAuthRedirect;

// MicrosoftAuthRedirect.jsx
import React, { useEffect } from "react";
import { useMsal } from "@azure/msal-react";

export const MicrosoftAuthRedirect = () => {
  const { accounts, instance } = useMsal();

  useEffect(() => {
    if (accounts.length > 0) {
      const account = accounts[0];
      instance
        .acquireTokenSilent({
          scopes: ["user.read"],
          account: account,
        })
        .then((response) => {
          fetch("http://localhost:8080/api/auth/microsoft", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              Accept: "*/*",
            },
            body: JSON.stringify({ authCode: response.accessToken }),
          })
            .then((res) => res.json())
            .then((data) => {
              // Manejar la respuesta del servidor aquí
              console.log("Datos recibidos del servidor de la Aplicacion: ", data);
            });
        });
    }
  }, [accounts, instance]);

  return <div>Autenticando con Microsoft...</div>;
};