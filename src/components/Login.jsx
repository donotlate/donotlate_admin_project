import React, { useContext, useEffect } from "react";
import "../css/Login.css";
import { AuthContext } from "./AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

const Login = () => {
  const globalState = useContext(AuthContext);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const reason = location.state?.reason;

    if (reason === "auth") {
      alert("로그인이 필요한 서비스입니다.");
    }

    if (reason === "logout") {
      alert("로그아웃 되었습니다.");
   }

    if (reason) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, []);

  return (
    <div className="admin-login-page">
      <div className="admin-login-header">
        <h1>Don't be late</h1>
        <p>관리자 로그인</p>
      </div>

      <div className="admin-login-card">
        <div className="input-row">
          <label htmlFor="userEmail">이메일</label>
          <input
            type="email"
            id="userEmail"
            placeholder="admin@dontbelate.com"
            required
            onChange={globalState.changeEmail}
          />
        </div>

        <div className="input-row">
          <label htmlFor="userPw">비밀번호</label>
          <input
            type="password"
            id="userPw"
            placeholder="••••••••"
            required
            onChange={globalState.changePassword}
          />
        </div>

        <button className="login-btn" onClick={globalState.handleLogin}>
          로그인
        </button>
      </div>
    </div>
  );
};

export default Login;
