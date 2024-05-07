import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import UserList from "./components/UserList";
import Layout from "./components/Layout"
import ProtectedRoute from "./components/ProtectedRoute";
// Context
import AuthProvider from "./components/AuthProvider";
import { ThemeProvider } from "./context/ThemeProvider";
import { DataProvider } from "./context/DataContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { MicrosoftAuthRedirect } from "./components/MicrosoftAuthRedirect";
import NotFoundPage from "./components/NotFoundPage";
import { TooltipProvider } from "./components/ui/tooltip";
import UatsList from "./components/UatsList";
import SettingsLayout from "./components/settings/SettingsLayout";
import Appearance from "./components/settings/Appearance";
import UatSettings from "./components/settings/UatSettings";

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
                <Route path="/signup" element={<SignUp />} />
                <Route path="/redirect/microsoft" element={<MicrosoftAuthRedirect />} />

                {/* Nested routes for settings within Layout */}
                <Route path="/" element={<ProtectedRoute redirectTo="/login"><Layout pageTitle="Dashboard" isDashboard={true} /></ProtectedRoute>}>
                  <Route path="dashboard" element={<Dashboard />} />
                </Route>
                <Route path="/" element={<ProtectedRoute redirectTo="/login"><Layout pageTitle="Profile" /></ProtectedRoute>}>
                  <Route path="profile" element={<Profile />} />
                </Route>
                <Route path="/" element={<ProtectedRoute redirectTo="/login"><Layout pageTitle="User List" /></ProtectedRoute>}>
                  <Route path="users" element={<UserList />} />
                </Route>
                <Route path="/" element={<ProtectedRoute redirectTo="/login"><Layout pageTitle="UAT List" /></ProtectedRoute>}>
                  <Route path="uats" element={<UatsList />} />
                </Route>
                <Route path="/" element={<ProtectedRoute redirectTo="/login"><Layout pageTitle="Settings" /></ProtectedRoute>}>
                  <Route path="settings" element={<SettingsLayout />}>
                  {/* Nested routes for settings within SettingsLayout */}
                    <Route index element={<Profile />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="uats" element={<UatSettings />} />
                    <Route path="appearance" element={<Appearance />} />
                  </Route>
                </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Router>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
