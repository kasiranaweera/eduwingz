/**
 * Diagnostic utilities for debugging API connection issues
 */

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://eduwingz-backend.onrender.com";

export const diagnostic = {
  /**
   * Test basic connectivity to backend
   */
  async testConnection() {
    console.log("🔍 Testing connection to:", BACKEND_URL);
    try {
      const response = await fetch(`${BACKEND_URL}/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      console.log("✅ Basic connection successful:", response.status);
      return { success: true, status: response.status };
    } catch (err) {
      console.error("❌ Basic connection failed:", err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Test CORS with OPTIONS preflight request
   */
  async testCORS() {
    console.log("🔍 Testing CORS with OPTIONS request to:", BACKEND_URL);
    try {
      const response = await fetch(`${BACKEND_URL}/users/token/`, {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'content-type',
        }
      });
      console.log("✅ CORS OPTIONS test successful:", response.status);
      console.log("🔍 CORS Response Headers:", {
        'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
      });
      return { success: true, status: response.status };
    } catch (err) {
      console.error("❌ CORS OPTIONS test failed:", err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Test CORS diagnostic endpoint
   */
  async testCORSDiagnostic() {
    console.log("🔍 Testing CORS diagnostic endpoint");
    try {
      const response = await fetch(`${BACKEND_URL}/cors-test/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Origin': window.location.origin,
        },
        credentials: 'include' // Include cookies
      });
      const data = await response.json();
      console.log("✅ CORS diagnostic test successful:", data);
      return { success: true, data };
    } catch (err) {
      console.error("❌ CORS diagnostic test failed:", err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Full diagnostic report
   */
  async runFullDiagnostics() {
    console.log("🔍 Running full diagnostics...");
    console.log("📊 Frontend URL:", window.location.origin);
    console.log("📊 Backend URL:", BACKEND_URL);
    
    const results = {
      frontend: {
        url: window.location.origin,
        userAgent: navigator.userAgent,
      },
      backend: {
        url: BACKEND_URL,
      },
      tests: {}
    };

    // Test 1: Basic connection
    results.tests.basicConnection = await this.testConnection();
    console.log("");

    // Test 2: CORS preflight
    results.tests.corsOptions = await this.testCORS();
    console.log("");

    // Test 3: CORS diagnostic endpoint
    results.tests.corsDiagnostic = await this.testCORSDiagnostic();
    console.log("");

    console.log("📋 Full Diagnostic Results:", results);
    return results;
  }
};

export default diagnostic;
