import privateClient from "../client/private.client";

const notificationEndpoints = {
  bookmarks: (messageId = "") =>
    `chat/bookmarks/${messageId ? `${messageId}/` : ""}`,
  bookmarksList: () => `chat/bookmarks/`,
  feedback: () => `chat/feedback/`,
  reports: () => `chat/reports/`,
  markGood: (sessionId, messageId) => `chat/sessions/${sessionId}/messages/${messageId}/mark-good/`,
  toggleBookmark: (sessionId, messageId) => `chat/sessions/${sessionId}/messages/${messageId}/bookmark/`,
};

const notificationApi = {
  // Bookmark endpoints
  createBookmark: async (messageId, data = {}) => {
    try {
      const payload = {
        message_id: messageId,
        ...data,
      };
      const response = await privateClient.post(notificationEndpoints.bookmarksList(), payload);
      return { response };
    } catch (err) {
      return { err };
    }
  },

  getBookmarks: async () => {
    try {
      const response = await privateClient.get(notificationEndpoints.bookmarksList());
      return { response };
    } catch (err) {
      return { err };
    }
  },

  deleteBookmark: async (bookmarkId) => {
    try {
      const response = await privateClient.delete(
        notificationEndpoints.bookmarks(bookmarkId)
      );
      return { response };
    } catch (err) {
      return { err };
    }
  },

  // Toggle bookmark status for a message
  toggleBookmark: async (sessionId, messageId, data = {}) => {
    try {
      const payload = {
        is_bookmarked: data.is_bookmarked ?? true,
        title: data.title,
        content: data.content,
      };
      const response = await privateClient.put(
        notificationEndpoints.toggleBookmark(sessionId, messageId),
        payload
      );
      return { response };
    } catch (err) {
      return { err };
    }
  },

  // Feedback endpoints (Good/Bad response)
  createFeedback: async (messageId, feedbackType) => {
    try {
      const payload = {
        message_id: messageId,
        feedback_type: feedbackType, // 'good' or 'bad'
      };
      const response = await privateClient.post(notificationEndpoints.feedback(), payload);
      return { response };
    } catch (err) {
      return { err };
    }
  },

  // Mark message as good (updates is_good flag on message)
  markMessageGood: async (sessionId, messageId, isGood = true) => {
    try {
      const payload = {
        is_good: isGood,
      };
      const response = await privateClient.put(
        notificationEndpoints.markGood(sessionId, messageId),
        payload
      );
      return { response };
    } catch (err) {
      return { err };
    }
  },

  // Report issue endpoints
  createReport: async (messageId, reportDetails) => {
    try {
      const payload = {
        message_id: messageId,
        ...reportDetails, // { reason, description, etc }
      };
      const response = await privateClient.post(notificationEndpoints.reports(), payload);
      return { response };
    } catch (err) {
      return { err };
    }
  },
};

export default notificationApi;
