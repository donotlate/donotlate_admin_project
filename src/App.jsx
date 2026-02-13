import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; 
import AdminPage from './components/AdminPage.jsx';
import { AuthProvider, AuthContext } from './components/AuthContext.jsx'; 
import Login from './components/Login.jsx';
import { useContext, useEffect } from 'react';

// --- 1. 관리자 접근 제한 컴포넌트 (문지기) ---
const AdminGuard = ({ children }) => {
  const { loginMember } = useContext(AuthContext);
  const saved = localStorage.getItem("loginMember");

  // 현재 로그인 상태인지 확인
  const isAuthenticated = loginMember || (saved && saved !== "null");

  useEffect(() => {

  }, [isAuthenticated]);

  if (!isAuthenticated) {
    alert("로그인이 필요한 서비스입니다.");
    return <Navigate to="/login" replace />;
  }

  return children;
};
// --- 2. 메인 App 컴포넌트 ---
function App() {
  return (
    <BrowserRouter>
      {/* AuthProvider가 모든 라우트를 감싸서 데이터를 공급합니다. */}
      <AuthProvider> 
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

// --- 3. 실제 화면을 그리는 컴포넌트 ---
function AppContent() {
  // AppContext에서 필요한 정보만 가져옴
  // 이제 setLoginMember 로직은 AuthContext 내부 useEffect가 처리하므로 여기선 뺍니다.
  const { loginMember } = useContext(AuthContext);

  return (
    <div className='body-login'>
      <Routes>
        {/* 로그인/루트 페이지 */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} /> 
        
        {/* 관리자 페이지: AdminGuard로 감싸서 보호 */}
        <Route 
          path="/admin" 
          element={
            <AdminGuard>
              <AdminPage />
            </AdminGuard>
          } 
        />

        {/* 정의되지 않은 주소는 모두 로그인으로 리다이렉트 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;