import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import AuthProvider from "./components/AuthProvider";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "./context/ThemeProvider";
import { DataProvider } from "./context/DataContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { MicrosoftAuthRedirect } from "./components/MicrosoftAuthRedirect";

// Google Provider Data
const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
// console.debug("clientID for GoogleOAuthProvider is: " + clientId);

// Componente principal
function App() {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
          <DataProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/redirect/microsoft" element={<MicrosoftAuthRedirect />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute redirectTo="/login">
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="/" element={<ProtectedRoute redirectTo="/" />} />
              </Routes>
            </Router>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
