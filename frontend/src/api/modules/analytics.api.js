import privateClient from "../client/private.client";

const analyticsEndpoints = {
  student: (userId) => `app/analytics/student/${userId}/`,
  overview: () => `app/analytics/overview/`,
};

const analyticsApi = {
  getStudentAnalytics: async (userId) => {
    try {
      const response = await privateClient.get(analyticsEndpoints.student(userId));
      return { response };
    } catch (err) {
      return { err };
    }
  },

  getOverview: async () => {
    try {
      const response = await privateClient.get(analyticsEndpoints.overview());
      return { response };
    } catch (err) {
      return { err };
    }
  }
};

export default analyticsApi;
