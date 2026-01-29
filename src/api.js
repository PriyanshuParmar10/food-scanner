// frontend/src/api.js
import axios from "axios";

const API = axios.create({
  // Use VITE_API_URL in production, fallback to localhost
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

// Automatically add the token to every request if it exists
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers["auth-token"] = token;
  }
  return req;
});

export default API;