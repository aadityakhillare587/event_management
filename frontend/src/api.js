import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach Bearer token to every request if user is logged in
API.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      if (parsed.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for unified error responses
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token expired or unauthorized, we can optionally clear session if 401
    if (error.response && error.response.status === 401) {
      // If user info exists, let caller handle or clear
    }
    return Promise.reject(error);
  }
);

export default API;

