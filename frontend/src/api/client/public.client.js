import axios from "axios";
import queryString from "query-string";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://eduwingz-backend.onrender.com";
const baseURL = BACKEND_URL;

console.log("🔌 Public Client initialized with baseURL:", baseURL);

const publicClient = axios.create({
  baseURL,
  timeout: 30000, // 30 second timeout
  withCredentials: true, // Allow cookies and CORS credentials
  paramsSerializer: {
    encode: params => queryString.stringify(params)
  }
});

publicClient.interceptors.request.use(async config => {
  const headers = {
    ...(config && config.headers ? config.headers : {})
  };
  if (!headers["Content-Type"] && !(config.data instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  config.headers = headers;
  console.log("📤 [Public API Request]", config.method.toUpperCase(), baseURL + config.url);
  return config;
});

publicClient.interceptors.response.use((response) => {
  console.log("✅ [Public API Response]", response.status, response.statusText, response.data);
  if (response && response.data) return response.data;
  return response;
}, (err) => {
  // Log all error details for debugging
  console.error("❌ [API Error Details]", {
    message: err.message,
    code: err.code,
    status: err.response?.status,
    statusText: err.response?.statusText,
    data: err.response?.data,
  });

  // Server responded with error status (4xx, 5xx)
  if (err.response) {
    console.error("❌ [Server Error Response]", {
      status: err.response.status,
      statusText: err.response.statusText,
      data: err.response.data,
    });
    
    if (err.response.data) {
      throw err.response.data;
    }
    throw err;
  }
  
  // Network error or no response from server (includes CORS errors)
  if (!err.response) {
    console.error("❌ [Network/CORS Error - No Server Response]", {
      message: err.message,
      code: err.code,
      baseURL: baseURL,
      errorMessage: err.message,
    });
    
    // Handle different network error codes
    let errorMessage = "Unable to connect to server. Checking connection...";
    
    if (err.code === "ECONNABORTED") {
      errorMessage = "Request timeout. Server is slow. Try again.";
    } else if (err.code === "ERR_NETWORK" || err.code === "ENOTFOUND") {
      // ERR_NETWORK typically means CORS or DNS failure
      errorMessage = "Cannot reach server. Check internet or server status.";
    } else if (err.message && err.message.includes("timeout")) {
      errorMessage = "Request timeout. Please try again.";
    } else if (err.message && err.message.includes("CORS")) {
      errorMessage = "CORS error. Server configuration issue.";
    }
    
    const networkError = new Error(errorMessage);
    networkError.code = err.code;
    networkError.originalError = err;
    throw networkError;
  }
});

export default publicClient;