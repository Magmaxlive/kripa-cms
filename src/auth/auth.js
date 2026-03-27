import axios from "axios";

const ApiUrl = process.env.NEXT_PUBLIC_API_URL;
export const baseURL = `${ApiUrl}/api/admin`;

axios.defaults.withCredentials = true;

if (typeof window !== "undefined") {
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const original = error.config;

      if (
        error.response?.status === 401 &&
        !original._retry &&
        !original.url?.includes("/auth/refresh/")
      ) {
        original._retry = true;
        try {
          await axios.post(`${baseURL}/auth/refresh/`);
          return axios(original);
        } catch {
          document.cookie = "isLoggedIn=; path=/; max-age=0";
          window.location.href = "/auth/signin";
        }
      }

      return Promise.reject(error);
    }
  );
}