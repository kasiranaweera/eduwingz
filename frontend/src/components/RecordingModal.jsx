import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Typography,
  TextField,
  IconButton,
  Chip,
  LinearProgress,
  Divider,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import sttApi from "../api/modules/stt.api";
import { useSelector } from "react-redux";
import { themeModes } from "../configs/theme.config";
import {
  Close,
  PlayCircleOutline,
  Stop,
  StopCircleOutlined,
} from "@mui/icons-material";

const RecordingModal = ({ open, onClose, onSubmit, isLoading = false }) => {
  const { themeMode } = useSelector((state) => state.themeMode);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [transcribedText, setTranscribedText] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [autoSubmitTimer, setAutoSubmitTimer] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyzerRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationFrameRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const canvasRef = useRef(null);

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Setup audio context for visualization
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
      analyzerRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyzerRef.current);
      analyzerRef.current.fftSize = 256;
      dataArrayRef.current = new Uint8Array(
        analyzerRef.current.frequencyBinCount
      );

      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: "audio/wav" });
        setRecordedAudio(audioBlob);
        const url = sttApi.createAudioUrl(audioBlob);
        setAudioUrl(url);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // Start visualization
      drawVisualization();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  // Draw waveform visualization
  const drawVisualization = () => {
    if (!canvasRef.current || !analyzerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const bufferLength = dataArrayRef.current.length;

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyzerRef.current.getByteFrequencyData(dataArrayRef.current);

      const isDark = themeMode === themeModes.dark;
      ctx.fillStyle = isDark
        ? "rgba(30, 30, 30, 0.5)"
        : "rgba(255, 255, 255, 0.5)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = "#3b82f6";
      ctx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArrayRef.current[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    }
  };

  // Transcribe audio
  const transcribeAudio = async () => {
    if (!recordedAudio) return;

    setIsTranscribing(true);
    try {
      const { response, err } = await sttApi.transcribeFile(recordedAudio);

      if (err) {
        console.error("Transcription error:", err);
        alert("Failed to transcribe audio. Please try again.");
        setIsTranscribing(false);
        return;
      }

      const text = response?.text || "";
      setTranscribedText(text);
      setEditedText(text);

      // Auto-submit after 5 seconds
      const timer = setTimeout(() => {
        handleSubmit(text);
      }, 10000);

      setAutoSubmitTimer(timer);
    } catch (error) {
      console.error("Error transcribing audio:", error);
      alert("Error transcribing audio. Please try again.");
    } finally {
      setIsTranscribing(false);
    }
  };

  // Handle submit
  const handleSubmit = (textToSubmit) => {
    const finalText = isEditing ? editedText : textToSubmit;

    if (autoSubmitTimer) {
      clearTimeout(autoSubmitTimer);
    }

    onSubmit(finalText, recordedAudio);
    handleClose();
  };

  // Play/pause audio
  const toggleAudioPlayback = () => {
    if (!audioPlayerRef.current) return;

    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (isRecording) {
      stopRecording();
    }

    if (autoSubmitTimer) {
      clearTimeout(autoSubmitTimer);
    }

    if (audioUrl) {
      sttApi.revokeAudioUrl(audioUrl);
    }

    // Reset all state
    setRecordedAudio(null);
    setAudioUrl(null);
    setTranscribedText("");
    setEditedText("");
    setIsTranscribing(false);
    setRecordingTime(0);
    setIsPlaying(false);
    setIsEditing(false);
    setAutoSubmitTimer(null);

    onClose();
  };

  // Format time display (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        sttApi.revokeAudioUrl(audioUrl);
      }
      if (autoSubmitTimer) {
        clearTimeout(autoSubmitTimer);
      }
    };
  }, [audioUrl, autoSubmitTimer]);

  return (
    <Box
      open={open}
      onClose={handleClose}
      fullWidth
      sx={{ border: 1, borderColor: "divider", borderRadius: 3, p: 2 }}
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <Box sx={{ fontWeight: "bold" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="body2">Voice Assistant</Typography>
          <IconButton onClick={handleClose}>
            <Close sx={{ width: "16px", height: "16px" }} />
          </IconButton>
        </Box>
      </Box>

      <Divider sx={{ my: 1 }} />

      <Box sx={{}}>
        {/* Recording Section */}
        {!recordedAudio ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Record/Stop button */}
            <IconButton onClick={isRecording ? stopRecording : startRecording}>
              {isRecording ? <StopCircleOutlined /> : <PlayCircleOutline />}
            </IconButton>

            {/* Recording indicator */}
            {isRecording && (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      backgroundColor: "#ef4444",
                      animation: "pulse 1s infinite",
                      "@keyframes pulse": {
                        "0%, 100%": { opacity: 1 },
                        "50%": { opacity: 0.5 },
                      },
                    }}
                  />
                  <Typography variant="body1" color="error">
                    Recording...
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body1"
                    sx={{
                      fontFamily: "monospace",
                      color: "error.main",
                    }}
                  >
                    {formatTime(recordingTime)}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Recording time */}
            {!isRecording && (
              <Typography
                variant="body1"
                sx={{
                  fontFamily: "monospace",
                  color: "text.secondary",
                }}
              >
                {formatTime(recordingTime)}
              </Typography>
            )}

            {/* Canvas for waveform visualization */}
            <canvas
              ref={canvasRef}
              width={"550"}
              height={50}
              style={{
                border: `1px solid ${
                  themeMode === themeModes.dark ? "#444" : "#ddd"
                }`,
                borderRadius: "8px",
                backgroundColor:
                  themeMode === themeModes.dark ? "#1a1a1a" : "#f5f5f5",
              }}
            />

            {/* <Typography
              variant="caption"
              display="block"
              sx={{ mt: 2, color: "text.secondary" }}
            >
              Click to start recording your message
            </Typography> */}
          </Box>
        ) : (
          <>
            {/* Playback Section */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {/* Audio player (hidden) */}
              <audio
                ref={audioPlayerRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                // style={{ display: "none" }}
              />

              {/* Playback controls */}
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  alignItems: "center",
                  p: 1,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 3,
                  flexGrow: 1,
                }}
              >
                <IconButton
                  size="small"
                  onClick={toggleAudioPlayback}
                  sx={{ color: "primary.main" }}
                >
                  {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>

                <Typography variant="body2" sx={{ flex: 1 }}>
                  {isPlaying ? "Playing..." : "Ready to play"}
                </Typography>

                <Chip
                  label={`${(recordedAudio.size / 1024).toFixed(1)} KB`}
                  size="small"
                  variant="outlined"
                />

                <IconButton
                  size="small"
                  onClick={() => {
                    setRecordedAudio(null);
                    setAudioUrl(null);
                    setTranscribedText("");
                    setEditedText("");
                    if (audioPlayerRef.current) {
                      audioPlayerRef.current.pause();
                    }
                    setIsPlaying(false);
                    sttApi.revokeAudioUrl(audioUrl);
                  }}
                  sx={{}}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
              {/* Transcription Section */}
              {!transcribedText && !isTranscribing ? (
                <Box sx={{}}>
                  <Button
                    onClick={transcribeAudio}
                    variant="outlined"
                    color="success"
                    sx={{ borderRadius: 3, p: 1.5 }}
                  >
                    Transcribe Audio
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={24} sx={{}} />
                  <Typography variant="body2" color="text.secondary">
                    Transcribing audio...
                  </Typography>
                </Box>
              )}
            </Box>

            {/* {isTranscribing && (
              
            )} */}

            {transcribedText && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="subtitle2" sx={{}}>
                    Transcription
                  </Typography>
                  <>
                    {!isEditing ? (
                      <IconButton
                        size="small"
                        onClick={() => setIsEditing(true)}
                        sx={{}}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    ) : (
                      <IconButton
                        size="small"
                        onClick={() => {
                          setIsEditing(false);
                          setTranscribedText(editedText);
                        }}
                        sx={{}}
                      >
                        <CheckIcon fontSize="small" />
                      </IconButton>
                    )}
                  </>
                </Box>

                {isEditing ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{ borderRadius: 3 }}
                  />
                ) : (
                  <Box
                    sx={{
                      p: 1,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 3,
                      minHeight: "100px",
                      overflowY: "auto",
                    }}
                  >
                    <Typography variant="body2">{transcribedText}</Typography>
                  </Box>
                )}

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="body2"
                    display="block"
                    sx={{ color: "text.secondary" }}
                  >
                    ⏱️ Auto-submit in 10 seconds...
                  </Typography>
                  {transcribedText && (
                    <Button
                      onClick={() => handleSubmit(transcribedText)}
                      variant="outlined"
                      disabled={isLoading || isTranscribing}
                      sx={{ borderRadius: 2 }}
                    >
                      {isLoading ? (
                        <>
                          <CircularProgress size={16} sx={{ mr: 1 }} />
                          Sending...
                        </>
                      ) : (
                        "Send Message"
                      )}
                    </Button>
                  )}
                </Box>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default RecordingModal;
