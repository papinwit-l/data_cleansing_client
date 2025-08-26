import axios from "axios";

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    // "https://phpstack-1457287-5755937.cloudwaysapps.com",
    "http://localhost:8200",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
