import axios from "axios";
import queryString from "query-string";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://eduwingz-backend.onrender.com";
const baseURL = BACKEND_URL;

console.log("🔌 Public Client initialized with baseURL:", baseURL);

const publicClient = axios.create({
  baseURL,
  timeout: 30000, // 30 second timeout
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
  console.log("📤 [Public API Request]", config.method.toUpperCase(), config.url);
  return config;
});

publicClient.interceptors.response.use((response) => {
  console.log("✅ [Public API Response]", response.status, response.statusText);
  if (response && response.data) return response.data;
  return response;
}, (err) => {
  // Network error or no response from server
  if (!err.response) {
    console.error("❌ [Network Error]", {
      message: err.message,
      code: err.code,
      baseURL: baseURL,
      url: err.config?.url,
      timeout: err.config?.timeout
    });
    
    // Create user-friendly error message
    let errorMessage = "Unable to connect to the server. Please try again.";
    
    if (err.code === "ECONNABORTED") {
      errorMessage = "Request timeout. The server is taking too long to respond. Please try again.";
    } else if (err.code === "ERR_NETWORK") {
      errorMessage = "Network error. Please check your internet connection.";
    }
    
    const networkError = new Error(errorMessage);
    networkError.code = err.code;
    throw networkError;
  }
  
  // Server responded with error status
  console.error("❌ [API Error Response]", {
    status: err.response.status,
    statusText: err.response.statusText,
    data: err.response.data,
    url: err.response.config?.url
  });
  
  if (err.response.data) {
    throw err.response.data;
  }
  throw err;
});

export default publicClient;