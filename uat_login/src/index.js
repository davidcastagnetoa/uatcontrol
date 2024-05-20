// index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "./globals.css";

// Microsoft OAuth Libraries
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";

// Microsoft Provider Data
const MSClientId = process.env.REACT_APP_MICROSOFT_APP_CLIENT_ID;
const MS_TENANT_ID = process.env.REACT_APP_MICROSOFT_APP_TENANT_ID;

const msalConfig = {
  auth: {
    clientId: MSClientId,
    authority: `https://login.microsoftonline.com/${MS_TENANT_ID}`,
    redirectUri: "http://localhost:3000/redirect/microsoft",
    postLogoutRedirectUri: "/",
  },
};

const msalInstance = new PublicClientApplication(msalConfig);
await msalInstance.initialize();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
