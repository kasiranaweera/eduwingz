import axios from "axios";
import queryString from "query-string";

const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || "http://localhost:8001") || "https://eduwingz-backend.onrender.com";
const baseURL = `${BACKEND_URL}/api`;

const publicClient = axios.create({
  baseURL,
  paramsSerializer: {
    encode: params => queryString.stringify(params)
  }
});

publicClient.interceptors.request.use(async config => {
  return {
    ...config,
    headers: {
      "Content-Type": "application/json"
    }
  };
});

publicClient.interceptors.response.use((response) => {
  if (response && response.data) return response.data;
  return response;
}, (err) => {
  throw err.response.data;
});

export default publicClient;