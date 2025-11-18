import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { themeModes } from "../configs/theme.config";
import { useSelector } from "react-redux";
import TravelExploreOutlinedIcon from "@mui/icons-material/TravelExploreOutlined";
import FormatShapesOutlinedIcon from "@mui/icons-material/FormatShapesOutlined";
import { useFormik } from "formik";
import * as Yup from "yup";
import TemplateModal from "./TemplateModal";
import AttachmentMenu from "./AttachmentMenu";
import AddIcon from "@mui/icons-material/Add";
import { Link } from "react-router-dom";
import FloatingPageUpButton from "./FloatingPageUpButton";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import MicOutlinedIcon from "@mui/icons-material/MicOutlined";
import StopCircleOutlinedIcon from "@mui/icons-material/StopCircleOutlined";
import RecordingModal from "./RecordingModal";

const ChatSection = ({
  sx,
  handleSendMessage,
  main,
  quotedMessage,
  onClearQuote,
}) => {
  const { themeMode } = useSelector((state) => state.themeMode);
  const [templateModalOpen, setTemplateModalOpen] = useState();
  const [uploadFiles, setUploadFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recordingModalOpen, setRecordingModalOpen] = useState(false);

  const chatFormik = useFormik({
    initialValues: {
      message: "",
    },
    validationSchema: Yup.object({
      message: Yup.string()
        .required("Message is required")
        .max(5000, "Message too long (max 5000 characters)"),
    }),
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        setIsLoading(true);
        const filesToSend = uploadFiles.map((item) => item.file);

        resetForm();
        setUploadFiles([]);

        console.log(
          "Submitting message with files:",
          filesToSend.map((f) => ({ name: f.name, size: f.size }))
        );
        const success = await handleSendMessage(values.message, filesToSend);
        if (success) {
          uploadFiles.forEach((item) => {
            if (item.previewUrl) {
              URL.revokeObjectURL(item.previewUrl);
            }
          });
        } else {
          console.error(
            "Message sending failed - keeping files in upload list"
          );
        }
      } catch (error) {
        console.error("Error in form submission:", error);
      } finally {
        setSubmitting(false);
        setIsLoading(false);
      }
    },
  });

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      chatFormik.handleSubmit();
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    const previewUrl = file.type.startsWith("image/")
      ? URL.createObjectURL(file)
      : null;
    setUploadFiles((prevFiles) => [
      ...prevFiles,
      {
        file,
        previewUrl,
      },
    ]);
  };

  // Handle voice recording submission
  const handleVoiceRecordingSubmit = async (transcribedText, audioBlob) => {
    try {
      setIsLoading(true);

      // Create a File object from the blob for consistency with file uploads
      const audioFile = new File([audioBlob], "recording.wav", {
        type: "audio/wav",
      });
      const filesToSend = [audioFile];

      console.log("Submitting voice message:", {
        text: transcribedText,
        audioFile: audioFile.name,
        size: audioFile.size,
      });

      const success = await handleSendMessage(transcribedText, filesToSend);

      if (success) {
        console.log("Voice message sent successfully");
        setRecordingModalOpen(false);
      } else {
        console.error("Voice message sending failed");
      }
    } catch (error) {
      console.error("Error submitting voice message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    console.info("You clicked the Chip.");
  };

  const handleDelete = (idx) => {
    setUploadFiles((prev) => {
      const next = [...prev];
      const [removed] = next.splice(idx, 1);
      if (removed?.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return next;
    });
  };

  return (
    <Box sx={{ ...sx }}>
      {/* Main Chat Input */}
      <Box
        sx={{ display: "flex", justifyContent: "center", position: "sticky" }}
      >
        <FloatingPageUpButton />
      </Box>
      <Paper
        component="form"
        onSubmit={chatFormik.handleSubmit}
        sx={{
          backgroundColor: "background.paper",
          p: 3,
          borderRadius: 5,
        }}
      >
        {/* Recording Modal */}
        {recordingModalOpen && (
          <RecordingModal
            open={recordingModalOpen}
            onClose={() => setRecordingModalOpen(false)}
            onSubmit={handleVoiceRecordingSubmit}
            isLoading={isLoading}
          />
        )}
        {/* Quoted Message Display */}
        {quotedMessage && (
          <Box
            sx={{
              mb: 1,
              p: 2,
              border: 1,
              borderColor: "divider",
              borderLeft: 3,
              borderLeftColor: "primary.main",
              borderRadius: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 1,
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", fontWeight: "bold" }}
              >
                Quoted Reply:
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  color: "text.primary",
                }}
              >
                {quotedMessage}
              </Typography>
            </Box>
            {onClearQuote && (
              <IconButton
                size="small"
                onClick={onClearQuote}
                sx={{ flexShrink: 0 }}
              >
                <CloseOutlinedIcon sx={{ width: "18px", height: "18px" }} />
              </IconButton>
            )}
          </Box>
        )}
        <TextField
          disabled={recordingModalOpen}
          sx={{ width: "100%" }}
          label="What can I do for you..."
          name="message"
          multiline
          rows={recordingModalOpen ? 1 : 3}
          variant="standard"
          value={chatFormik.values.message}
          onChange={chatFormik.handleChange}
          onBlur={chatFormik.handleBlur}
          onKeyPress={handleKeyPress}
          error={
            chatFormik.touched.message && Boolean(chatFormik.errors.message) && !recordingModalOpen
          }
          helperText={chatFormik.touched.message && chatFormik.errors.message}
        />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 1,
          }}
        >
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <AttachmentMenu onFileSelect={handleFileSelect} />
            {/* <Button
              startIcon={<TravelExploreOutlinedIcon />}
              sx={{
                backgroundColor: "graycolor.two",
                textTransform: "none",
                color: "primary.contrastText",
                "&:hover": { color: "primary.main" },
                px: 2,
                borderRadius: 100,
              }}
            >
              Search
            </Button> */}
            <Button
              startIcon={<FormatShapesOutlinedIcon />}
              onClick={() => setTemplateModalOpen(true)}
              sx={{
                backgroundColor: "graycolor.two",
                textTransform: "none",
                color: "primary.contrastText",
                "&:hover": { color: "primary.main" },
                px: 2,
                borderRadius: 100,
              }}
            >
              Template
            </Button>
          </Box>
          {main === "true" ? (
            <IconButton
              type="submit"
              disabled={!chatFormik.values.message || chatFormik.isSubmitting}
              component={Link}
              to="/dashboard/chat"
              sx={{
                display: { xs: "none", md: "flex" },
                "&:hover": { color: "primary.main" },
                color:
                  themeMode === themeModes.dark
                    ? "primary.contrastText"
                    : "primary.contrastText",
              }}
            >
              <SendIcon />
            </IconButton>
          ) : (
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              {chatFormik.values.message.length > 0 ? (
                <IconButton
                  type="submit"
                  disabled={chatFormik.isSubmitting}
                  sx={{
                    display: { xs: "none", md: "flex" },
                    "&:hover": { color: "primary.main" },
                    color:
                      themeMode === themeModes.dark
                        ? "primary.contrastText"
                        : "primary.contrastText",
                  }}
                >
                  <SendIcon />
                </IconButton>
              ) : (
                <>
                  <Tooltip title="Record voice message">
                    <IconButton
                      onClick={() => setRecordingModalOpen(true)}
                      disabled={isLoading || recordingModalOpen}
                      sx={{
                        display: { xs: "none", md: "flex" },
                        "&:hover": { color: "primary.main" },
                        color:
                          themeMode === themeModes.dark
                            ? "primary.contrastText"
                            : "primary.contrastText",
                      }}
                    >
                      <MicOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                  {isLoading && <CircularProgress size={24} />}
                </>
              )}
            </Box>
          )}
        </Box>
        {uploadFiles.length > 0 ? (
          <>
            <Divider sx={{ my: 1 }} orientation="horizontal" flexItem />
            <Box
              sx={{
                display: "flex",
                gap: 1,
                maxWidth: "100%",
                flexWrap: "wrap",
              }}
            >
              {uploadFiles.map((item, index) => {
                const { file, previewUrl } = item;
                return (
                  <Box
                    sx={{ position: "relative" }}
                    key={`${file.name}-${index}`}
                  >
                    <Tooltip title={file.name} arrow>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          border: 1,
                          borderColor: "graycolor.two",
                          borderRadius: 3,
                          py: 1,
                          pl: 1,
                          pr: 4,
                        }}
                      >
                        {file.type.startsWith("image/") ? (
                          <Avatar
                            variant="rounded"
                            src={previewUrl || undefined}
                            alt={file.name}
                          >
                            <ImageOutlinedIcon />
                          </Avatar>
                        ) : file.type.startsWith("application/") ? (
                          <Avatar variant="rounded">
                            <PictureAsPdfOutlinedIcon />
                          </Avatar>
                        ) : (
                          <Avatar variant="rounded">
                            <UploadFileOutlinedIcon />
                          </Avatar>
                        )}

                        <Box sx={{ width: "100%" }}>
                          <Typography variant="body2">{file.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {(file.size / 1024).toFixed(2)} KB
                          </Typography>
                        </Box>
                      </Box>
                    </Tooltip>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(index)}
                      sx={{ position: "absolute", top: 0, right: 0 }}
                    >
                      <CloseOutlinedIcon
                        sx={{ width: "16px", height: "16px" }}
                      />
                    </IconButton>
                  </Box>
                );
              })}
            </Box>
          </>
        ) : (
          <></>
        )}
      </Paper>

      {/* Template Modal */}
      <TemplateModal
        open={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        onSubmit={(template) => handleSendMessage(template, [])}
      />
    </Box>
  );
};

export default ChatSection;
