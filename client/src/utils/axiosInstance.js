import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://courier-system-mq9e.onrender.com/api',

    // baseURL: 'http://localhost:3000/api',
});

axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default axiosInstance;
