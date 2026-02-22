import axios from "axios";
import queryString from "query-string";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://eduwingz-backend.onrender.com";
const baseURL = BACKEND_URL;

console.log("🔌 Private Client initialized with baseURL:", baseURL);

const privateClient = axios.create({
  baseURL,
  timeout: 30000, // 30 second timeout
  withCredentials: true, // Allow cookies and CORS credentials
  paramsSerializer: {
    encode: params => queryString.stringify(params)
  }
});

privateClient.interceptors.request.use(async config => {
  // Attach headers safely. Only add Authorization when a token exists.
  let token = localStorage.getItem("actkn");

  // If `actkn` is not set, try to extract token from stored `user` object
  if (!token) {
    const userRaw = localStorage.getItem("user");
    if (userRaw) {
      try {
        let userObj = JSON.parse(userRaw);
        // sometimes `user` is double-stringified
        if (typeof userObj === 'string') {
          userObj = JSON.parse(userObj);
        }
        token = userObj?.token || userObj?.access || userObj?.actkn || null;
      } catch (e) {
        // ignore parse errors
      }
    }
  }

  const headers = {
    ...(config && config.headers ? config.headers : {})
  };
  // Only set Content-Type to application/json if it's not already set (e.g., for multipart/form-data)
  if (!headers["Content-Type"] && !(config.data instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // Mutate and return the config object as expected by axios
  config.headers = headers;
  console.log("📤 [Private API Request]", config.method.toUpperCase(), baseURL + config.url, token ? "[Authenticated]" : "[Public]");
  return config;
});

privateClient.interceptors.response.use((response) => {
  console.log("✅ [Private API Response]", response.status, response.statusText, response.data);
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
    
    if (err.response.data) throw err.response.data;
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

export default privateClient;