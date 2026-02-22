import axios from "axios";
import queryString from "query-string";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://eduwingz-backend.onrender.com";
const baseURL = BACKEND_URL;

console.log("🔌 Private Client initialized with baseURL:", baseURL);

const privateClient = axios.create({
  baseURL,
  timeout: 30000, // 30 second timeout
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
  console.log("📤 [Private API Request]", config.method.toUpperCase(), config.url, token ? "[Authenticated]" : "[Public]");
  return config;
});

privateClient.interceptors.response.use((response) => {
  console.log("✅ [Private API Response]", response.status, response.statusText, response.data);
  if (response && response.data) return response.data;
  return response;
}, (err) => {
  // Log all error details for debugging
  console.error("❌ [API Error Full Details]", {
    message: err.message,
    code: err.code,
    errno: err.errno,
    status: err.response?.status,
    statusText: err.response?.statusText,
    data: err.response?.data,
    config: {
      baseURL: err.config?.baseURL,
      url: err.config?.url,
      method: err.config?.method,
      timeout: err.config?.timeout,
    }
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
  
  // Network error or no response from server
  if (!err.response) {
    console.error("❌ [Network/CORS Error - No Server Response]", {
      message: err.message,
      code: err.code,
      baseURL: baseURL,
    });
    
    // Create user-friendly error message
    let errorMessage = "Unable to connect to server. Check your internet connection.";
    
    if (err.code === "ECONNABORTED") {
      errorMessage = "Request timeout. Server took too long to respond. Please try again.";
    } else if (err.code === "ERR_NETWORK" || err.code === "ENOTFOUND") {
      errorMessage = "Network error. Please check your internet connection.";
    } else if (err.message && err.message.includes("CORS")) {
      errorMessage = "Server access denied. This is a server configuration issue.";
    }
    
    const networkError = new Error(errorMessage);
    networkError.code = err.code;
    networkError.originalError = err;
    throw networkError;
  }
});

export default privateClient;