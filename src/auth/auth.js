import axios from "axios";

const ApiUrl = process.env.NEXT_PUBLIC_API_URL;
export const baseURL = `${ApiUrl}/api/admin`;

axios.defaults.withCredentials = true;

// Auto-refresh on 401
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes("/auth/refresh/")  // ← prevent loop
    ) {
      original._retry = true;

      try {
        await axios.post(`${baseURL}/auth/refresh/`);
        return axios(original);
      } catch {
        window.location.href = "/auth/signin";
      }
    }

    return Promise.reject(error);
  }
);