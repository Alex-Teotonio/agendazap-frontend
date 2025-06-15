import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://y5ghcb4jv8.execute-api.us-east-1.amazonaws.com/dev",
});

export default api;
