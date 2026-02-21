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
  console.log("✅ [Private API Response]", response.status, response.statusText);
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
    const networkError = new Error(
      `Network error: Cannot reach ${baseURL}. Check if the server is running and accessible.`
    );
    throw networkError;
  }
  
  // Server responded with error status
  console.error("❌ [API Error Response]", {
    status: err.response.status,
    statusText: err.response.statusText,
    data: err.response.data,
    url: err.response.config?.url
  });
  
  if (err.response.data) throw err.response.data;
  throw err;
});

export default privateClient;