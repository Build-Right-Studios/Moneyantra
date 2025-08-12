import axios from "axios";

// Localhost backend URL
const backendUrl = 'http://localhost:8080';

const axiosInstance = axios.create({
    baseURL: backendUrl,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("token");
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosInstance;
