import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // IF 401 AND it's not a retry AND we have a refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");

      if (refreshToken) {
        try {
          // Attempt to get a new access token
          const { data } = await axios.post(`${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/"}token/refresh/`, {
            refresh: refreshToken
          });

          // If successful, save new token and retry original request
          localStorage.setItem("access_token", data.access);
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return API(originalRequest);
        } catch (refreshError) {
          // If refresh fails too, fall through to logout logic
          console.error("Session expired:", refreshError);
        }
      }
    }

    // Existing "Logout" Logic
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      const publicPaths = ['/', '/about', '/gallery', '/blog', '/careers', '/login', '/register', '/admin-login'];
      const isPublicPath = publicPaths.includes(window.location.pathname) || window.location.pathname.startsWith('/blog/');
      const isAuthEndpoint = error.config?.url?.includes('/login') || error.config?.url?.includes('/refresh');

      if (!isPublicPath && !isAuthEndpoint) {
        // Save where they were trying to go
        const cleanPath = window.location.pathname;
        if (cleanPath.includes('admin')) {
          window.location.href = `/admin-login?next=${cleanPath}`;
        } else {
          window.location.href = `/login?next=${cleanPath}`;
        }
      }
    }
    return Promise.reject(error);
  }
);

export default API;
