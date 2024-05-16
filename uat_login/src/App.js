import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from "react-router-dom";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import UserList from "./components/UserList";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
// Context
import AuthProvider from "./components/AuthProvider";
import { ThemeProvider } from "./context/ThemeProvider";
import { DataProvider } from "./context/DataContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { MicrosoftAuthRedirect } from "./components/MicrosoftAuthRedirect";
import NotFoundPage from "./components/NotFoundPage";
import UatsList from "./components/UatsList";
import SettingsLayout from "./components/settings/SettingsLayout";
import Appearance from "./components/settings/Appearance";
import UatSettings from "./components/settings/UatSettings";
import UATProxy from "./components/UATProxy";

// Google Provider Data
const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
// console.debug("clientID for GoogleOAuthProvider is: " + clientId);

// Componente principal
// prettier-ignore
function App() {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
          <DataProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/redirect/microsoft" element={<MicrosoftAuthRedirect />} />

                <Route path="/dashboard" element={
                    <ProtectedRoute redirectTo="/login">
                      <Layout pageTitle="Dashboard" isDashboard={true}>
                        <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                
                <Route path="/profile" element={
                    <ProtectedRoute redirectTo="/login">
                      <Layout pageTitle="Profile" isDashboard={false}>
                        <Profile />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route path="/users" element={
                    <ProtectedRoute redirectTo="/login">
                      <Layout pageTitle="User List" isDashboard={false}>
                        <UserList />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route path="/uats" element={
                    <ProtectedRoute redirectTo="/login">
                      <Layout pageTitle="UAT List" isDashboard={false}>
                        <UatsList />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route path="/proxy" element={
                    <ProtectedRoute redirectTo="/login">
                      <Layout pageTitle="Uat Page" isDashboard={false}>
                        <UATProxy />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* Nested routes for settings within Layout */}
                <Route path="/settings" element={
                    <ProtectedRoute redirectTo="/login">
                      <Layout pageTitle="Settings" isDashboard={false}>
                        <SettingsLayout>
                          <Outlet />
                        </SettingsLayout>
                      </Layout>
                    </ProtectedRoute>
                  }>
                     {/* Nested routes for settings within SettingsLayout */}
                    <Route index element={<Profile />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="uats" element={<UatSettings />} />
                    <Route path="appearance" element={<Appearance />} />
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
