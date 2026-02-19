import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginMember, setLoginMember] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navigate = useNavigate();

  const changeEmail = (e) => setEmail(e.target.value);
  const changePassword = (e) => setPassword(e.target.value);

  // 새로고침해도 로그인 유지(localStorage 복원)
  useEffect(() => {
    const saved = localStorage.getItem("loginMember");
    if (!saved || saved === "null") return;

    try {
      const parsed = JSON.parse(saved);
      setLoginMember(parsed);
    } catch {
      localStorage.removeItem("loginMember");
      setLoginMember(null);
    }
  }, []);

  // 로그인
  const handleLogin = async (e) => {
    try {
      e?.preventDefault?.();

      const resp = await axios.post("http://localhost/admin/login", {
        memberEmail: email,
        memberPw: password,
      });

      // 로그인 성공 판단
      if (resp.data?.memberEmail) {
        localStorage.setItem("loginMember", JSON.stringify(resp.data));
        setLoginMember(resp.data);
        navigate("/admin", { replace: true });
      } else {
        alert("아이디 또는 비밀번호를 확인해주세요.");
      }
    } catch (error) {
      console.error("서버 통신 에러:", error);
      alert("서버 오류가 발생했습니다.");
    }
  };

  // 로그아웃
  const handleLogout = async () => {
    try {
      const ok = window.confirm("로그아웃 하시겠습니까?");
      if (!ok) return;

      setIsLoggingOut(true);

      const resp = await axios.get("http://localhost/admin/logout");

      if (resp.status === 200) {
        localStorage.removeItem("loginMember");
        setLoginMember(null);

        // 로그아웃으로 이동: 뒤로가기 방지
        navigate("/login", { replace: true, state: { reason: "logout" } });
      }
    } catch (error) {
      console.log("로그아웃 중 에러 발생:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const globalState = {
    email,
    password,
    loginMember,
    isLoggingOut,
    changeEmail,
    changePassword,
    setLoginMember,
    handleLogin,
    handleLogout,
  };

  return (
    <AuthContext.Provider value={globalState}>
      {children}
    </AuthContext.Provider>
  );
};
