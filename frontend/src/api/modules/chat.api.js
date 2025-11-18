import privateClient from "../client/private.client";
import fastApiClient from "../client/fastapi.client";

const chatEndpoints = {
  sessions: (sessionId = "") => `chat/sessions/${sessionId ? `${sessionId}/` : ""}`,
  messages: (sessionId) => `chat/sessions/${sessionId}/messages/`,
  continue: (sessionId) => `chat/sessions/${sessionId}/continue/`,
  documents: (sessionId) => `chat/sessions/${sessionId}/documents/`,
  documentsByMessage: (messageId) => `chat/documents/${messageId}/`,
  documentsList: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return `chat/documents/${query ? `?${query}` : ""}`;
  },
  bookmarkToggle: (sessionId, messageId) => `chat/sessions/${sessionId}/messages/${messageId}/bookmark/`,
  bookmarks: (bookmarkId = "") => `chat/bookmarks/${bookmarkId ? `${bookmarkId}/` : ""}`,
  textToSpeech: () => `api/tts/generate/`,
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

  // list all sessions
  listSessions: async () => {
    try {
      const response = await privateClient.get(chatEndpoints.sessions());
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
      const basePayload = typeof data === "string"
        ? { content: data }
        : (data && data.content ? data : { content: data });
      const payload = {
        ...basePayload,
        ...(Array.isArray(basePayload?.document_ids) ? { document_ids: basePayload.document_ids } : {}),
      };
      const response = await privateClient.post(chatEndpoints.messages(sessionId), payload);
      return { response };
    } catch (err) {
      return { err };
    }
  },

  uploadDocument: async (sessionId, file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      // Don't set Content-Type - let axios set it automatically with boundary for FormData
      const response = await privateClient.post(
        chatEndpoints.documents(sessionId),
        formData
      );
      return { response };
    } catch (err) {
      return { err };
    }
  },

  listDocuments: async (sessionId) => {
    try {
      const response = await privateClient.get(chatEndpoints.documents(sessionId));
      return { response };
    } catch (err) {
      return { err };
    }
  },

  listAllDocuments: async (params = {}) => {
    try {
      const response = await privateClient.get(chatEndpoints.documentsList(params));
      return { response };
    } catch (err) {
      return { err };
    }
  },

  getDocumentsByMessage: async (messageId) => {
    try {
      const response = await privateClient.get(chatEndpoints.documentsByMessage(messageId));
      return { response };
    } catch (err) {
      return { err };
    }
  },

  deleteSession: async (sessionId) => {
    console.log("delete one button", sessionId)
    try {
      const response = await privateClient.delete(chatEndpoints.sessions(sessionId));
      return { response };
    } catch (err) {
      return { err };
    }
  },

  continueMessage: async (sessionId) => {
    try {
      const response = await privateClient.post(chatEndpoints.continue(sessionId), {});
      return { response };
    } catch (err) {
      return { err };
    }
  },

  textToSpeech: async (text, language = "English") => {
    try {
      const response = await fastApiClient.post(chatEndpoints.textToSpeech(), {
        text,
        language,
      });
      return { response };
    } catch (err) {
      return { err };
    }
  },

  toggleBookmark: async (sessionId, messageId, data = {}) => {
    try {
      const response = await privateClient.post(
        chatEndpoints.bookmarkToggle(sessionId, messageId),
        data
      );
      return { response };
    } catch (err) {
      return { err };
    }
  },

  listBookmarks: async () => {
    try {
      const response = await privateClient.get(chatEndpoints.bookmarks());
      return { response };
    } catch (err) {
      return { err };
    }
  },

  deleteBookmark: async (bookmarkId) => {
    try {
      const response = await privateClient.delete(chatEndpoints.bookmarks(bookmarkId));
      return { response };
    } catch (err) {
      return { err };
    }
  },
};

export default chatApi;
