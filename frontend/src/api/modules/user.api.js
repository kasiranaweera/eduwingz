import privateClient from "../client/private.client";
import publicClient from "../client/public.client";

const userEndpoints = {
  signin: "users/token/",
  signup: "user/signup",
  getInfo: "user/info",
  passwordUpdate: "user/update-password"
};

const userApi = {
  signin: async ({ email, password }) => {
    try {
      console.log("send request");
      const response = await publicClient.post(
        userEndpoints.signin,
        { email, password }
      );

      return { response };
    } catch (err) { console.log("err"); return { err }; }
  },
  signup: async ({ email, username, password, password2, firstname, lastname }) => {
    try {
      const response = await publicClient.post(
        userEndpoints.signup,
        { email, username, password, password2, firstname, lastname }
      );

      return { response };
    } catch (err) { return { err }; }
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