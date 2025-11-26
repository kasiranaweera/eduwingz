import privateClient from "../client/private.client";

const lessonEndpoints = {
  grades: "lessons/grades/",
  grade: (gradeId) => `lessons/grades/${gradeId}/`,
  gradeSubjects: (gradeId) => `lessons/grades/${gradeId}/subjects/`,
  subjects: "lessons/subjects/",
  subject: (subjectId) => `lessons/subjects/${subjectId}/`,
  subjectLessons: (subjectId) => `lessons/subjects/${subjectId}/lessons/`,
  lessons: (lessonId = "") => `lessons/lessons/${lessonId ? `${lessonId}/` : ""}`,
  session: (lessonId) => `lessons/lessons/${lessonId}/`,
  notes: (lessonId) => `lessons/lessons/${lessonId}/notes/`,
  addNote: (lessonId) => `lessons/lessons/${lessonId}/add_note/`,
  topics: (lessonId) => `lessons/lessons/${lessonId}/topics/`,
  addTopic: (lessonId) => `lessons/lessons/${lessonId}/add_topic/`,
  topic: (topicId) => `lessons/topics/${topicId}/`,
  topicGenerateContent: (topicId) => `lessons/topics/${topicId}/generate_content/`,
  createSession: "lessons/lessons/create_session/",
  generateLesson: "lessons/lessons/generate_lesson/",
  allLessons: "lessons/lessons/",
};

const lessonsApi = {
  // ==================== GRADES & SUBJECTS ====================

  /**
   * Get all grades
   * @returns {Promise}
   */
  getGrades: async () => {
    try {
      const response = await privateClient.get(lessonEndpoints.grades);
      return { response };
    } catch (err) {
      return { err };
    }
  },

  /**
   * Get subjects for a specific grade
   * @param {string} gradeId - UUID of the grade
   * @returns {Promise}
   */
  getGradeSubjects: async (gradeId) => {
    try {
      const response = await privateClient.get(lessonEndpoints.gradeSubjects(gradeId));
      return { response };
    } catch (err) {
      return { err };
    }
  },

  /**
   * Get all subjects
   * @returns {Promise}
   */
  getSubjects: async () => {
    try {
      const response = await privateClient.get(lessonEndpoints.subjects);
      return { response };
    } catch (err) {
      return { err };
    }
  },

  /**
   * Get lessons for a subject
   * @param {string} subjectId - UUID of the subject
   * @returns {Promise}
   */
  getSubjectLessons: async (subjectId) => {
    try {
      const response = await privateClient.get(lessonEndpoints.subjectLessons(subjectId));
      return { response };
    } catch (err) {
      return { err };
    }
  },

  // ==================== LESSONS ====================

  /**
   * Create a new lesson session (like chat session)
   * @param {Object} data - { title, description }
   * @returns {Promise}
   */
  createSession: async (data = {}) => {
    try {
      const payload = {
        title: data.title || "New Lesson Session",
        description: data.description || "",
      };
      const response = await privateClient.post(lessonEndpoints.createSession, payload);
      return { response };
    } catch (err) {
      return { err };
    }
  },

  /**
   * Generate lesson content using LLM
   * @param {Object} data - { grade, subject, topic, lesson_id, lesson_type }
   * @returns {Promise}
   */
  generateLesson: async (data = {}) => {
    try {
      const payload = {
        grade: data.grade,
        subject: data.subject,
        topic: data.topic,
        lesson_id: data.lesson_id,
        lesson_type: data.lesson_type || "default",
      };
      const response = await privateClient.post(lessonEndpoints.generateLesson, payload);
      return { response };
    } catch (err) {
      return { err };
    }
  },

  /**
   * Get a lesson by UUID
   * @param {string} lessonId - UUID of the lesson
   * @returns {Promise}
   */
  getLesson: async (lessonId) => {
    try {
      const response = await privateClient.get(lessonEndpoints.session(lessonId));
      return { response };
    } catch (err) {
      return { err };
    }
  },

  /**
   * List all lessons for current user
   * @returns {Promise}
   */
  listLessons: async () => {
    try {
      const response = await privateClient.get(lessonEndpoints.allLessons);
      return { response };
    } catch (err) {
      return { err };
    }
  },

  /**
   * Update a lesson
   * @param {string} lessonId - UUID of the lesson
   * @param {Object} data - Updated lesson data
   * @returns {Promise}
   */
  updateLesson: async (lessonId, data) => {
    try {
      const response = await privateClient.put(lessonEndpoints.session(lessonId), data);
      return { response };
    } catch (err) {
      return { err };
    }
  },

  /**
   * Partially update a lesson
   * @param {string} lessonId - UUID of the lesson
   * @param {Object} data - Partial lesson data
   * @returns {Promise}
   */
  partialUpdateLesson: async (lessonId, data) => {
    try {
      const response = await privateClient.patch(lessonEndpoints.session(lessonId), data);
      return { response };
    } catch (err) {
      return { err };
    }
  },

  /**
   * Delete a lesson
   * @param {string} lessonId - UUID of the lesson
   * @returns {Promise}
   */
  deleteLesson: async (lessonId) => {
    try {
      const response = await privateClient.delete(lessonEndpoints.session(lessonId));
      return { response };
    } catch (err) {
      return { err };
    }
  },

  // ==================== TOPICS ====================

  /**
   * Get all topics for a lesson
   * @param {string} lessonId - UUID of the lesson
   * @returns {Promise}
   */
  getTopics: async (lessonId) => {
    try {
      const response = await privateClient.get(lessonEndpoints.topics(lessonId));
      return { response };
    } catch (err) {
      return { err };
    }
  },

  /**
   * Add a topic to a lesson
   * @param {string} lessonId - UUID of the lesson
   * @param {Object} data - Topic data { title, content, resources, is_edit, order }
   * @returns {Promise}
   */
  addTopic: async (lessonId, data) => {
    try {
      const payload = {
        title: data.title || "",
        content: data.content || "",
        resources: data.resources || "",
        is_edit: data.is_edit || false,
        order: data.order || 0,
      };
      const response = await privateClient.post(lessonEndpoints.addTopic(lessonId), payload);
      return { response };
    } catch (err) {
      return { err };
    }
  },

  /**
   * Update a topic
   * @param {string} topicId - UUID of the topic
   * @param {Object} data - Updated topic data
   * @returns {Promise}
   */
  updateTopic: async (topicId, data) => {
    try {
      const response = await privateClient.put(lessonEndpoints.topic(topicId), data);
      return { response };
    } catch (err) {
      return { err };
    }
  },

  /**
   * Partially update a topic
   * @param {string} topicId - UUID of the topic
   * @param {Object} data - Partial topic data
   * @returns {Promise}
   */
  partialUpdateTopic: async (topicId, data) => {
    try {
      const response = await privateClient.patch(lessonEndpoints.topic(topicId), data);
      return { response };
    } catch (err) {
      return { err };
    }
  },

  /**
   * Delete a topic
   * @param {string} topicId - UUID of the topic
   * @returns {Promise}
   */
  deleteTopic: async (topicId) => {
    try {
      const response = await privateClient.delete(lessonEndpoints.topic(topicId));
      return { response };
    } catch (err) {
      return { err };
    }
  },

  /**
   * Generate (preview) content for a single topic via backend
   * @param {string} topicId - UUID of the topic
   * @param {boolean} save - whether to save the generated content to the topic (default false)
   */
  generateTopicContent: async (topicId, save = false) => {
    try {
      const payload = { save };
      const response = await privateClient.post(lessonEndpoints.topicGenerateContent(topicId), payload);
      return { response };
    } catch (err) {
      return { err };
    }
  },

  // ==================== NOTES ====================

  /**
   * Get all notes for a lesson
   * @param {string} lessonId - UUID of the lesson
   * @returns {Promise}
   */
  getNotes: async (lessonId) => {
    try {
      const response = await privateClient.get(lessonEndpoints.notes(lessonId));
      return { response };
    } catch (err) {
      return { err };
    }
  },

  /**
   * Add a note to a lesson
   * @param {string} lessonId - UUID of the lesson
   * @param {Object} data - Note data { title, content, description }
   * @returns {Promise}
   */
  addNote: async (lessonId, data) => {
    try {
      const payload = {
        title: data.title || "",
        content: data.content || "",
        description: data.description || "",
      };
      const response = await privateClient.post(lessonEndpoints.addNote(lessonId), payload);
      return { response };
    } catch (err) {
      return { err };
    }
  },

  /**
   * Delete a note
   * @param {string} noteId - ID of the note
   * @returns {Promise}
   */
  deleteNote: async (noteId) => {
    try {
      const response = await privateClient.delete(`lessons/notes/${noteId}/`);
      return { response };
    } catch (err) {
      return { err };
    }
  },

  /**
   * Update a note
   * @param {string} noteId - ID of the note
   * @param {Object} data - Updated note data
   * @returns {Promise}
   */
  updateNote: async (noteId, data) => {
    try {
      const response = await privateClient.put(`lessons/notes/${noteId}/`, data);
      return { response };
    } catch (err) {
      return { err };
    }
  },
};

export default lessonsApi;
