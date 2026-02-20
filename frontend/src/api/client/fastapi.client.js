import axios from "axios";

// Direct connection to FastAPI backend for TTS and other AI services
const FASTAPI_URL = process.env.REACT_APP_FASTAPI_URL || "https://eduwingz-fastapi.onrender.com";
const fastApiClient = axios.create({
  baseURL: FASTAPI_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

fastApiClient.interceptors.request.use(async config => {
  // Attach auth token from localStorage
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
  
  if (token) headers["Authorization"] = `Bearer ${token}`;

  config.headers = headers;
  return config;
});

fastApiClient.interceptors.response.use((response) => {
  if (response && response.data) return response.data;
  return response;
}, (err) => {
  // Be defensive: some errors (network issues) don't have response
  if (err && err.response && err.response.data) throw err.response.data;
  throw err;
});

export default fastApiClient;
