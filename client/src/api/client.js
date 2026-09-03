import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("vms_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("vms_token");
      localStorage.removeItem("vms_user");

      const isAuthPage =
        window.location.pathname === "/login" ||
        window.location.pathname === "/register" ||
        window.location.pathname.startsWith("/register/");

      if (!isAuthPage) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(err);
  }
);

export default api;