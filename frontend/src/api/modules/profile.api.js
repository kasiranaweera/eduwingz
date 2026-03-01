import privateClient from "../client/private.client";

const profileEndpoints = {
  getProfile: (userId) => `app/user/${userId}/profile/`,
  updateProfile: (userId) => `app/user/${userId}/profile/`,
};

const profileApi = {
  getProfile: async (userId) => {
    try {
      // Profile endpoint requires authentication on your backend — use privateClient
      const response = await privateClient.get(profileEndpoints.getProfile(userId));
      return { response };
    } catch (err) {
      return { err };
    }
  },

  updateProfile: async (userId, data) => {
    try {
      const response = await privateClient.put(profileEndpoints.updateProfile(userId), data);
      return { response };
    } catch (err) {
      return { err };
    }
  },

  updateLearningStyleAdjustments: async (userId, adjustments) => {
    try {
      const response = await privateClient.put(profileEndpoints.updateProfile(userId), {
        manual_adjustments: adjustments,
        manual_adjustments_completed: true,
      });
      return { response };
    } catch (err) {
      return { err };
    }
  },
};

export default profileApi;
