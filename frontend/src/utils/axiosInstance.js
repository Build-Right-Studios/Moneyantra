import axios from "axios";

// const backendUrl = 'https://moneyantra-186659791698.us-central1.run.app';
const backendUrl = 'http://localhost:8080/'

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
        if(accessToken){
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)

export default axiosInstance;