import privateClient from "../client/private.client";

const quizEndpoints = {
    list: "quiz/quizzes/",
    detail: (id) => `quiz/quizzes/${id}/`,
    generate: "quiz/quizzes/generate/",
    start: (id) => `quiz/quizzes/${id}/start/`,
    submit: (id) => `quiz/quizzes/${id}/submit/`,
    attempts: (id) => `quiz/quizzes/${id}/attempts/`,
};

const quizApi = {
    /**
     * Get all quizzes for the current user
     */
    getAll: async () => {
        try {
            const response = await privateClient.get(quizEndpoints.list);
            return { response };
        } catch (err) {
            return { err };
        }
    },

    /**
     * Get a single quiz with all questions
     */
    getById: async (quizId) => {
        try {
            const response = await privateClient.get(quizEndpoints.detail(quizId));
            return { response };
        } catch (err) {
            return { err };
        }
    },

    /**
     * Create a new quiz manually
     */
    create: async (data) => {
        try {
            const response = await privateClient.post(quizEndpoints.list, data);
            return { response };
        } catch (err) {
            return { err };
        }
    },

    /**
     * Generate an AI quiz via FastAPI
     * @param {Object} params - { topic, subject, grade, difficulty, num_questions, question_type, lesson_id? }
     */
    generateQuiz: async (params) => {
        try {
            const response = await privateClient.post(quizEndpoints.generate, params);
            return { response };
        } catch (err) {
            return { err };
        }
    },

    /**
     * Start a quiz attempt (returns questions without correct answers)
     */
    startAttempt: async (quizId) => {
        try {
            const response = await privateClient.post(quizEndpoints.start(quizId));
            return { response };
        } catch (err) {
            return { err };
        }
    },

    /**
     * Submit quiz answers
     * @param {string} quizId
     * @param {Object} data - { attempt_id, answers: [{question_id, selected_option_id}], time_taken }
     */
    submitAttempt: async (quizId, data) => {
        try {
            const response = await privateClient.post(quizEndpoints.submit(quizId), data);
            return { response };
        } catch (err) {
            return { err };
        }
    },

    /**
     * Get all attempts for a quiz
     */
    getAttempts: async (quizId) => {
        try {
            const response = await privateClient.get(quizEndpoints.attempts(quizId));
            return { response };
        } catch (err) {
            return { err };
        }
    },

    /**
     * Delete a quiz
     */
    deleteQuiz: async (quizId) => {
        try {
            const response = await privateClient.delete(quizEndpoints.detail(quizId));
            return { response };
        } catch (err) {
            return { err };
        }
    },
};

export default quizApi;
