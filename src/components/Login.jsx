import React, { useContext } from 'react';
import '../css/Login.css';
import { AuthContext } from './AuthContext';

const Login = () => {

  const globalState = useContext(AuthContext);

  return (
    <div className="admin-login-page">

      <div className="admin-login-header">
        <h1>Don't be late</h1>
        <p>관리자 로그인</p>
      </div>


      <div className="admin-login-card">
        <div className="input-row">
          <label htmlFor="userEmail">이메일</label>
          <input type="email" 
           id="userEmail"
           placeholder="admin@dontbelate.com" 
           required
           onChange={globalState.changeEmail}
           />
        </div>

        <div className="input-row">
          <label htmlFor="userPw">비밀번호</label>
          <input type="password" id="userPw" placeholder="••••••••" 
           required
           onChange={globalState.changePassword}
          />
        </div>

        <button className="login-btn" onClick={globalState.handleLogin}>로그인</button>
      </div>
    </div>
  );
};

export default Login;