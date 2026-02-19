import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";

import AdminPage from "./components/AdminPage.jsx";
import Login from "./components/Login.jsx";
import { AuthProvider, AuthContext } from "./components/AuthContext.jsx";

import { useLocation } from "react-router-dom";

// --- 1. 관리자 접근 제한 컴포넌트 (문지기) ---
const AdminGuard = ({ children }) => {
  const { isLoggingOut } = useContext(AuthContext);
  const location = useLocation();

  const token = localStorage.getItem("accessToken");

  const isAuthenticated = !!token;

  if (!isAuthenticated) {
    const reason = isLoggingOut ? "logout" : "auth";

    return (
      <Navigate
        to="/login"
        replace
        state={{ reason, from: location.pathname }}
      />
    );
  }

  return children;
};

// --- 2. 메인 App 컴포넌트 ---
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="body-login">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Login />} />

            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminPage />
                </AdminGuard>
              }
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
