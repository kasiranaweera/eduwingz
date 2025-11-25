import privateClient from "../client/private.client";

const documentEndpoints = {
  documents: () => `chat/documents/`,
  document: (docId) => `chat/documents/${docId}/`,
  uploadDocument: (sessionId) => `chat/sessions/${sessionId}/documents/`,
  deleteDocument: (docId) => `chat/documents/${docId}/`,
  downloadDocument: (docId) => `chat/documents/${docId}/download/`,
  shareDocument: (docId) => `chat/documents/${docId}/share/`,
  archiveDocument: (docId) => `chat/documents/${docId}/archive/`,
  unarchiveDocument: (docId) => `chat/documents/${docId}/unarchive/`,
};

const documentApi = {
  /**
   * Get all documents for the authenticated user
   * @param {Object} params - Query parameters { search }
   * @returns {Promise}
   */
  getDocuments: async (params = {}) => {
    try {
      const queryString = new URLSearchParams();
      
      if (params.search) {
        queryString.append("search", params.search);
      }

      const url = queryString.toString() 
        ? `${documentEndpoints.documents()}?${queryString.toString()}`
        : documentEndpoints.documents();

      const response = await privateClient.get(url);
      
      // Handle both direct array response and wrapped responses
      let documents = response;
      if (response && typeof response === 'object' && !Array.isArray(response)) {
        documents = response.results || response.data || response;
      }
      
      return { response: Array.isArray(documents) ? documents : [] };
    } catch (err) {
      console.error("Error in getDocuments:", err);
      return { err };
    }
  },

  /**
   * Get a single document by ID
   * @param {string} docId - Document ID
   * @returns {Promise}
   */
  getDocument: async (docId) => {
    try {
      const response = await privateClient.get(documentEndpoints.document(docId));
      return { response };
    } catch (err) {
      return { err };
    }
  },

  /**
   * Upload a new document to a session
   * @param {string} sessionId - Session UUID
   * @param {File} file - File object to upload
   * @param {Object} metadata - { title, description }
   * @returns {Promise}
   */
  uploadDocument: async (sessionId, file, metadata = {}) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (metadata.title) formData.append("title", metadata.title);
      if (metadata.description) formData.append("description", metadata.description);

      const response = await privateClient.post(
        documentEndpoints.uploadDocument(sessionId),
        formData
      );
      return { response };
    } catch (err) {
      return { err };
    }
  },

  /**
   * Delete a document
   * @param {string} docId - Document ID
   * @returns {Promise}
   */
  deleteDocument: async (docId) => {
    try {
      const response = await privateClient.delete(documentEndpoints.deleteDocument(docId));
      return { response };
    } catch (err) {
      return { err };
    }
  },

  /**
   * Download a document
   * @param {string} docId - Document ID
   * @returns {Promise}
   */
  downloadDocument: async (docId) => {
    try {
      const response = await privateClient.get(
        documentEndpoints.downloadDocument(docId),
        {
          responseType: "blob",
        }
      );
      return { response };
    } catch (err) {
      return { err };
    }
  },

  /**
   * Share a document
   * @param {string} docId - Document ID
   * @param {Object} data - { user_ids, email_list, permission_level }
   * @returns {Promise}
   */
  shareDocument: async (docId, data = {}) => {
    try {
      const payload = {
        user_ids: data.user_ids || [],
        email_list: data.email_list || [],
        permission_level: data.permission_level || "view",
      };
      const response = await privateClient.post(
        documentEndpoints.shareDocument(docId),
        payload
      );
      return { response };
    } catch (err) {
      return { err };
    }
  },

  /**
   * Archive a document
   * @param {string} docId - Document ID
   * @returns {Promise}
   */
  archiveDocument: async (docId) => {
    try {
      const response = await privateClient.post(
        documentEndpoints.archiveDocument(docId)
      );
      return { response };
    } catch (err) {
      return { err };
    }
  },

  /**
   * Unarchive a document
   * @param {string} docId - Document ID
   * @returns {Promise}
   */
  unarchiveDocument: async (docId) => {
    try {
      const response = await privateClient.post(
        documentEndpoints.unarchiveDocument(docId)
      );
      return { response };
    } catch (err) {
      return { err };
    }
  },

  /**
   * Update document metadata
   * @param {string} docId - Document ID
   * @param {Object} data - { title, description }
   * @returns {Promise}
   */
  updateDocument: async (docId, data = {}) => {
    try {
      const response = await privateClient.patch(
        documentEndpoints.document(docId),
        data
      );
      return { response };
    } catch (err) {
      return { err };
    }
  },
};

export default documentApi;
