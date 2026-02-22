import privateClient from "../client/private.client";
import publicClient from "../client/public.client";

const userEndpoints = {
  signin: "users/token/",
  signup: "users/register/",
  getInfo: "user/info",
  passwordUpdate: "user/update-password"
};

const userApi = {
  signin: async ({ email, password }) => {
    try {
      console.log("🔄 [LOGIN] Sending login request to:", userEndpoints.signin);
      const response = await publicClient.post(
        userEndpoints.signin,
        { email, password }
      );

      console.log("✅ [LOGIN] Response received:", response);
      return { response };
    } catch (err) { 
      console.error("❌ [LOGIN] Error occurred:", err);
      return { err }; 
    }
  },
  signup: async ({ email, username, password, confirmPassword}) => {
    try {
      console.log("🔄 [SIGNUP] Sending registration request to:", userEndpoints.signup);
      console.log("🔄 [SIGNUP] Data:", { email, username, password: "***" });
      
      // backend RegisterSerializer expects `password2` as the confirmation field name
      const response = await publicClient.post(
        userEndpoints.signup,
        { email, username, password, password2: confirmPassword }
      );

      console.log("✅ [SIGNUP] Response received:", response);
      return { response };
    } catch (err) { 
      console.error("❌ [SIGNUP] Error occurred:", err);
      return { err }; 
    }
  },
  getInfo: async () => {
    try {
      const response = await privateClient.get(userEndpoints.getInfo);

      return { response };
    } catch (err) { return { err }; }
  },
  passwordUpdate: async ({ password, newPassword, confirmNewPassword }) => {
    try {
      const response = await privateClient.put(
        userEndpoints.passwordUpdate,
        { password, newPassword, confirmNewPassword }
      );

      return { response };
    } catch (err) { return { err }; }
  }
};

export default userApi;