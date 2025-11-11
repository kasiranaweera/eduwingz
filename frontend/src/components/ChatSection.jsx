import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
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
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import MicOutlinedIcon from '@mui/icons-material/MicOutlined';

const ChatSection = ({ sx, handleSendMessage, main }) => {
  const { themeMode } = useSelector((state) => state.themeMode);
  const [templateModalOpen, setTemplateModalOpen] = useState();
  const [uploadFiles, setUploadFiles] = useState([]);

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
        const filesToSend = uploadFiles.map((item) => item.file);
        console.log("Submitting message with files:", filesToSend.map(f => ({ name: f.name, size: f.size })));
        const success = await handleSendMessage(values.message, filesToSend);
        if (success) {
          resetForm();
          uploadFiles.forEach((item) => {
            if (item.previewUrl) {
              URL.revokeObjectURL(item.previewUrl);
            }
          });
          setUploadFiles([]);
        } else {
          console.error("Message sending failed - keeping files in upload list");
        }
      } catch (error) {
        console.error("Error in form submission:", error);
      } finally {
        setSubmitting(false);
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
    const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
    setUploadFiles((prevFiles) => [
      ...prevFiles,
      {
        file,
        previewUrl,
      },
    ]);
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
        <TextField
          sx={{ width: "100%", mb: 1 }}
          label="What can I do for you..."
          name="message"
          multiline
          rows={3}
          variant="standard"
          value={chatFormik.values.message}
          onChange={chatFormik.handleChange}
          onBlur={chatFormik.handleBlur}
          onKeyPress={handleKeyPress}
          error={
            chatFormik.touched.message && Boolean(chatFormik.errors.message)
          }
          helperText={chatFormik.touched.message && chatFormik.errors.message}
        />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <AttachmentMenu onFileSelect={handleFileSelect} />
            <Button
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
            </Button>
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
            <IconButton
              type="submit"
              disabled={!chatFormik.values.message || chatFormik.isSubmitting}
              sx={{
                display: { xs: "none", md: "flex" },
                "&:hover": { color: "primary.main" },
                color:
                  themeMode === themeModes.dark
                    ? "primary.contrastText"
                    : "primary.contrastText",
              }}
            >
              {chatFormik.values.message.length > 0 ? <SendIcon /> : <MicOutlinedIcon />}
            </IconButton>
          )}
        </Box>
        {uploadFiles.length > 0 ? (
          <>
            <Divider sx={{ my: 1 }} orientation="horizontal" flexItem />
            <Box sx={{ display: "flex", gap: 1, maxWidth: "100%", flexWrap: "wrap" }}>
              {uploadFiles.map((item, index) => {
                const { file, previewUrl } = item;
                return (
                  <Box sx={{ position: "relative" }} key={`${file.name}-${index}`}>
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
                          <Avatar variant="rounded" src={previewUrl || undefined} alt={file.name}>
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
                      <CloseOutlinedIcon sx={{ width: "16px", height: "16px" }} />
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
