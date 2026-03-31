import axios from "axios";
import { getToken, isTokenExpired, logout } from "../pages/AuthPages/Auth.ts";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + "/api",
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      if (isTokenExpired(token)) {
        logout();
        window.location.href = "/signin";
        return Promise.reject(new Error("Token expired"));
      }

      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      logout();
      window.location.href = "/signin";
    }
    return Promise.reject(err);
  }
);


export default api;
