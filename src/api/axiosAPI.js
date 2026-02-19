import axios from "axios";

export const axiosApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // 예: https://donotlate.kro.kr
});

// 요청 보낼 때마다 자동으로 토큰 붙이기
axiosApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


export default axiosApi;