import React, { createContext, useState } from 'react';
import axios from "axios";
import { useNavigate } from 'react-router-dom';

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


    // 로그인 요청
    const handleLogin = async() => {
        try{
            const resp = await axios.post('http://localhost/admin/adminLogin',{
                memberEmail:email,
                memberPw:password
            });
            console.log("서버가 보낸 원본 데이터:", resp.data);

            if(resp.data && resp.data.memberEmail){
                console.log("로그인 성공",resp.data);
                setLoginMember(resp.data);
                navigate("./admin");
            }else {
                alert("아이디 또는 비밀번호를 확인해주세요.");
            }
        } catch(error){
            console.error("서버 통신 에러" ,error);
        }
    }

    // globalState 이 안에 이메일,비밀번호 들어있음
    const globalState = {
    email,
    password,
    loginMember,
    changeEmail,
    changePassword,
    handleLogin
  };
  
  return(
    <AuthContext.Provider value={globalState}> 
        { children }
    </AuthContext.Provider>
  )

}