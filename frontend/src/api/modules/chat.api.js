import privateClient from "../client/private.client";

const chatEndpoints = {
  sessions: (sessionId = "") => `chat/sessions/${sessionId}`,
  messages: (sessionId) => `chat/sessions/${sessionId}/messages/`,
  documentsUpload: () => `chat/documents/upload/`,
};

const chatApi = {
  createSession: async (data = {}) => {
    try {
      const response = await privateClient.post(chatEndpoints.sessions(), data);
      return { response };
    } catch (err) {
      return { err };
    }
  },

  getSession: async (sessionId) => {
    try {
      const response = await privateClient.get(chatEndpoints.sessions(sessionId));
      return { response };
    } catch (err) {
      return { err };
    }
  },

  getMessages: async (sessionId) => {
    try {
      const response = await privateClient.get(chatEndpoints.messages(sessionId));
      return { response };
    } catch (err) {
      return { err };
    }
  },

  postMessage: async (sessionId, data) => {
    try {
      // backend expects { "content": "..." }
      const payload = typeof data === 'string' ? { content: data } : (data && data.content ? data : { content: data });
      const response = await privateClient.post(chatEndpoints.messages(sessionId), payload);
      return { response };
    } catch (err) {
      return { err };
    }
  }
};

export default chatApi;
