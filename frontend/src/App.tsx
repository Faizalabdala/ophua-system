// frontend/src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { AuthProvider } from "./contexts/AuthContext";
import { ophuaTheme } from "./theme";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UsersManagement from "./pages/admin/UsersManagement";
import Header from "./components/layout/Header";
import PrivateRoute from "./components/PrivateRoute";
import { Box } from "@mui/material";

function App() {
  return (
    <ThemeProvider theme={ophuaTheme}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/"
              element={
                <PrivateRoute>
                  <>
                    <Header />
                    <Box sx={{ p: 3 }}>
                      <Dashboard />
                    </Box>
                  </>
                </PrivateRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <>
                    <Header />
                    <Box sx={{ p: 3 }}>
                      <Dashboard />
                    </Box>
                  </>
                </PrivateRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <PrivateRoute allowedRoles={["ADMIN"]}>
                  <>
                    <Header />
                    <Box sx={{ p: 3 }}>
                      <UsersManagement />
                    </Box>
                  </>
                </PrivateRoute>
              }
            />

            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
