// AuthContext.jsx 일부 (핵심만 예시)
import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { axiosAPI } from "../api/axiosAPI";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginMember, setLoginMember] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navigate = useNavigate();

  const changeEmail = (e) => setEmail(e.target.value);
  const changePassword = (e) => setPassword(e.target.value);

const handleLogin = async () => {
  try {
    const resp = await axiosAPI.post("/admin/login", {
      memberEmail: email,
      memberPw: password,
    });

    // 토큰 저장
    localStorage.setItem("accessToken", resp.data.accessToken);

    localStorage.setItem(
      "loginMember",
      JSON.stringify({
        memberName: resp.data.memberName,
        memberEmail: resp.data.memberEmail,
        profileImg: resp.data.profileImg
      })
    );

    // Context 상태 세팅
    setLoginMember({
      memberName: resp.data.memberName,
      memberEmail: resp.data.memberEmail,
      profileImg: resp.data.profileImg
    });

    navigate("/admin", { replace: true });

  } catch (err) {
    if (err.response?.status === 401) {
      alert("아이디 또는 비밀번호가 올바르지 않습니다.");
      return;
    }

    console.log("로그인 실패:", err);
    alert("로그인 중 오류가 발생했습니다.");
  }
};

  const handleLogout = () => {
    setIsLoggingOut(true);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("loginMember");
    setLoginMember(null);
    navigate("/login", { replace: true, state: { reason: "logout" } });
    setIsLoggingOut(false);
  };

  useEffect(() => {
  const saved = localStorage.getItem("loginMember");

  if (saved) {
    setLoginMember(JSON.parse(saved));
  }
}, []);

  return (
    <AuthContext.Provider
      value={{
        email,
        password,
        loginMember,
        setLoginMember,
        isLoggingOut,
        changeEmail,
        changePassword,
        handleLogin,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};