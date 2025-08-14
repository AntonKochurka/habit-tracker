import axios from "axios";

const api = axios.create({
	withCredentials: true,
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
	// TODO: make here a Bearer auth.

  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

			// TODO: make here redirect to login page 

      const message = data?.message || "An error occurred";
      console.error(message);

      if (status === 403) {
        console.warn("Forbidden action attempted");
      }

      if (status >= 500) {
        console.error("Server error:", data);
      }
    }

    return Promise.reject(error);
  }
);

export default api;