import fastApiClient from "../client/fastapi.client";

const sttEndpoints = {
  transcribe: () => `api/stt/transcribe/`,
  transcribeBase64: () => `api/stt/transcribe-base64/`,
};

/**
 * Speech-to-Text API module
 * Handles audio transcription similar to TTS module structure
 */
const sttApi = {
  /**
   * Transcribe audio file to text
   * @param {File} audioFile - Audio file to transcribe
   * @returns {Promise} Object with text, segments, filename, language, status
   */
  transcribeFile: async (audioFile) => {
    try {
      const formData = new FormData();
      formData.append("file", audioFile);

      const response = await fastApiClient.post(
        sttEndpoints.transcribe(),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return { response };
    } catch (err) {
      console.error("Error transcribing audio file:", err);
      return { err };
    }
  },

  /**
   * Transcribe audio from base64 encoded data
   * @param {string} audioBase64 - Base64 encoded audio data
   * @param {string} filename - Original filename (default: 'audio.wav')
   * @returns {Promise} Object with text, segments, filename, language, status
   */
  transcribeBase64: async (audioBase64, filename = "audio.wav") => {
    try {
      const formData = new FormData();
      formData.append("audio_base64", audioBase64);
      formData.append("filename", filename);

      const response = await fastApiClient.post(
        sttEndpoints.transcribeBase64(),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return { response };
    } catch (err) {
      console.error("Error transcribing base64 audio:", err);
      return { err };
    }
  },

  /**
   * Convert audio blob to base64
   * @param {Blob} audioBlob - Audio blob from MediaRecorder
   * @returns {Promise<string>} Base64 encoded audio string
   */
  blobToBase64: (audioBlob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Remove data:audio/wav;base64, prefix if present
        const base64 = reader.result.split(",")[1] || reader.result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });
  },

  /**
   * Create audio playback URL from blob
   * @param {Blob} audioBlob - Audio blob
   * @returns {string} Object URL for playback
   */
  createAudioUrl: (audioBlob) => {
    return URL.createObjectURL(audioBlob);
  },

  /**
   * Clean up audio URL
   * @param {string} audioUrl - Audio URL to revoke
   */
  revokeAudioUrl: (audioUrl) => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  },
};

export default sttApi;
