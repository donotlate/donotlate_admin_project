
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();


export const AuthProvider= ({ children })=>{

    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const [loginMember, setLoginMember] = useState(null);

    const navigate = useNavigate();

    const changeEmail = (e)=>{
        setEmail(e.target.value);
    }
    const changePassword = (e)=>{
        setPassword(e.target.value);
    }

    // sts + react 현상 중 새로고침 시  로그아웃 됨 그걸 막기 위해 랜더링하여 로그인 상태 만듦
    useEffect(() => {
    const saved = localStorage.getItem("loginMember");
    if(saved) setLoginMember(JSON.parse(saved));
    }, []);

    // 로그인 
    const handleLogin = async (e) => {

    try {
        const resp = await axios.post("http://localhost/admin/login", {
            memberEmail: email,
            memberPw: password
        });
        localStorage.setItem("loginMember", JSON.stringify(resp.data));
        setLoginMember(resp.data);

        console.log("서버 응답:", resp.data);

        if (resp.data?.memberEmail) {
            setLoginMember(resp.data);
            navigate("/admin");
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
        try{
            const resp = await axios.get("http://localhost/admin/logout")

            if(resp.status === 200){
                setLoginMember(null);
                navigate("/");
            }
        }catch(error){
            console.log("로그아웃 중 에러 발생:" ,error);
        }
    }

    // globalState 이 안에 이메일,비밀번호 들어있음
    const globalState = {
    email,
    password,
    loginMember,
    changeEmail,
    changePassword,
    handleLogin,
    handleLogout
  };
  
  return(
    <AuthContext.Provider value={globalState}> 
        { children }
    </AuthContext.Provider>
  )

}