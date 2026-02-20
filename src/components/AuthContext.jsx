import axiosAPI from "../api/axiosAPI";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginMember, setLoginMember] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navigate = useNavigate();


  const changeEmail = (e) => setEmail(e.target.value);
  const changePassword = (e) => setPassword(e.target.value);

  // 로그인
  const handleLogin = async () => {
    try {
      const resp = await axiosAPI.post("/admin/login", {
        memberEmail: email,
        memberPw: password,
      });

      localStorage.setItem("accessToken", resp.data.token);

      const memberInfo = {
        memberEmail: resp.data.memberEmail,
        memberName: resp.data.memberName,
      };
      localStorage.setItem("loginMember", JSON.stringify(memberInfo));
      setLoginMember(memberInfo);

      navigate("/admin");
    } catch (err) {
      alert("로그인 실패");
      console.log(err);
    }
  };

  // 로그아웃
  const handleLogout = () => {
    setIsLoggingOut(true);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("loginMember");
    setLoginMember(null);
    navigate("/login", { replace: true, state: { reason: "logout" } });
    setIsLoggingOut(false);
  };

  return (
    <AuthContext.Provider
      value={{
        email,
        password,
        loginMember,
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
