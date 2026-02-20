import axios from "axios";

export const axiosAPI = axios.create({
  baseURL: "http://localhost",
});

// 요청 보낼 때마다 자동으로 토큰 붙이기
axiosAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


export default axiosAPI;