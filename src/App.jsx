import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'; 
import AdminPage from './components/AdminPage.jsx';
import { AuthProvider } from './components/AuthContext.jsx';
import Login from './components/Login.jsx';

function App() {
  return (
    // 1. AuthProvider는 데이터(Context)를 공급합니다.
    // 2. BrowserRouter는 페이지 이동(Navigation) 기능을 공급합니다.
    <BrowserRouter>
      <AuthProvider>
        <div className='body-login'>
          <Routes>
            {/* 로그인 페이지 경로 */}
            <Route path="/login" element={<Login />} />
            
            {/* 관리자 페이지 경로 */}
            <Route path="/admin" element={<AdminPage />} />
            
            {/* 기본 경로 페이지 */}
            <Route path="/" element={<Login />} /> 
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App;