import axios from "axios";

// Create an Axios instance
const api = axios.create({
  baseURL: "http://localhost:5000/api", // change if your backend runs on different port
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to inject token
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
