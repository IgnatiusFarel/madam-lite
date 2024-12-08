import axios from "axios";

const http = axios.create();

http.defaults.baseURL = "http://127.0.0.1:3000/api";

http.defaults.headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

http.defaults.timeout = 5000;
http.interceptors.request.use(
  (config) => {
    const token = JSON.parse(sessionStorage.getItem("token"));
    if (token) {
      config.headers.Authorization = `Bearer ${token?.value}`;
      config.headers["Content-Type"] = "application/json";
      config.headers.Accept = "application/json";
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

http.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    return Promise.reject(error.response);
  }
);

export default http;
