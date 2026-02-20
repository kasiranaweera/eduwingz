import axios from "axios";
import queryString from "query-string";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://eduwingz-backend.onrender.com";
const baseURL = BACKEND_URL;

const publicClient = axios.create({
  baseURL,
  paramsSerializer: {
    encode: params => queryString.stringify(params)
  }
});

publicClient.interceptors.request.use(async config => {
  const headers = {
    ...(config && config.headers ? config.headers : {})
  };
  if (!headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  config.headers = headers;
  return config;
});

publicClient.interceptors.response.use((response) => {
  if (response && response.data) return response.data;
  return response;
}, (err) => {
  // Be defensive: some errors (network issues) don't have response
  if (err && err.response && err.response.data) {
    console.error("API Error Response:", err.response.data);
    throw err.response.data;
  }
  console.error("API Error (no response data):", err);
  throw err;
});

export default publicClient;