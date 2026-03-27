import axios from "axios";

const ApiUrl = process.env.NEXT_PUBLIC_API_URL;
export const baseURL = `${ApiUrl}/api/admin`;

axios.defaults.withCredentials = true;

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
        // Small delay to allow browser to store the new cookie
        await new Promise(resolve => setTimeout(resolve, 200));
        return axios(original);
      } catch {
        window.location.href = "/auth/signin";
      }
    }

    return Promise.reject(error);
  }
);