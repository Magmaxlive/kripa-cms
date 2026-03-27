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
        // Full reload instead of retry — forces browser to use new cookie
        window.location.reload();
        return new Promise(() => {}); // prevent further execution
      } catch {
        window.location.href = "/auth/signin";
      }
    }

    return Promise.reject(error);
  }
);