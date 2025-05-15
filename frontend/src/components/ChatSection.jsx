import React, { useState } from "react";
import { 
  Box, 
  Button, 
  IconButton, 
  Paper, 
  TextField
} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import { themeModes } from "../configs/theme.config";
import { useSelector } from "react-redux";
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import FormatShapesOutlinedIcon from '@mui/icons-material/FormatShapesOutlined';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import TemplateModal from './TemplateModal';
import AttachmentMenu from './AttachmentMenu';
import AddIcon from "@mui/icons-material/Add";
import { Link } from "react-router-dom";


const ChatSection = ({ sx, handleSendMessage, main }) => {
  const { themeMode } = useSelector((state) => state.themeMode);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  // Main chat formik
  const chatFormik = useFormik({
    initialValues: {
      message: ''
    },
    validationSchema: Yup.object({
      message: Yup.string()
        .required('Message is required')
        .max(5000, 'Message too long (max 5000 characters)')
    }),
    onSubmit: (values, { resetForm }) => {
      handleSendMessage(values.message);
      resetForm();
    }
  });

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      chatFormik.handleSubmit();
    }
  };

  const handleFileSelect = (file) => {
    // Handle the selected file (upload, display, etc.)
    console.log('Selected file:', file);
    // You might want to add the file name to the message or upload it
  };

  return (
    <Box sx={{ ...sx }}>
      {/* Main Chat Input */}
      <Paper 
        component="form" 
        onSubmit={chatFormik.handleSubmit}
        sx={{
          backgroundColor: 'background.paper', 
          p: 3, 
          borderRadius: 5
        }}
      >
        <TextField
          sx={{ width: '100%', mb: 1 }}
          label="What can I do for you..."
          name="message"
          multiline
          rows={3}
          variant="standard"
          value={chatFormik.values.message}
          onChange={chatFormik.handleChange}
          onBlur={chatFormik.handleBlur}
          onKeyPress={handleKeyPress}
          error={chatFormik.touched.message && Boolean(chatFormik.errors.message)}
          helperText={chatFormik.touched.message && chatFormik.errors.message}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <AttachmentMenu onFileSelect={handleFileSelect} />
            <Button 
              startIcon={<TravelExploreOutlinedIcon />} 
              sx={{
                backgroundColor: 'graycolor.two', 
                textTransform: 'none', 
                color: 'primary.contrastText', 
                '&:hover': { color: 'primary.main' }, 
                px: 2, 
                borderRadius: 100
              }}
            >
              Search
            </Button>
            <Button 
              startIcon={<FormatShapesOutlinedIcon />} 
              onClick={() => setTemplateModalOpen(true)}
              sx={{
                backgroundColor: 'graycolor.two', 
                textTransform: 'none', 
                color: 'primary.contrastText', 
                '&:hover': { color: 'primary.main' }, 
                px: 2, 
                borderRadius: 100
              }}
            >
              Template
            </Button>
          </Box>
          {main ==='true'? <IconButton
            type="submit"
            disabled={!chatFormik.values.message}
            component={Link}
            to='/dashboard/chat'
            sx={{
              display: { xs: "none", md: "flex" },
              "&:hover": { color: "primary.main" },
              color: themeMode === themeModes.dark
                ? "primary.contrastText"
                : "primary.contrastText",
            }}
          >
            <SendIcon />
          </IconButton> : <IconButton
            type="submit"
            disabled={!chatFormik.values.message}
            sx={{
              display: { xs: "none", md: "flex" },
              "&:hover": { color: "primary.main" },
              color: themeMode === themeModes.dark
                ? "primary.contrastText"
                : "primary.contrastText",
            }}
          >
            <SendIcon />
          </IconButton>}
        </Box>
      </Paper>

      {/* Template Modal */}
      <TemplateModal
        open={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        onSubmit={(template) => handleSendMessage(template)}
      />
    </Box>
  );
};

export default ChatSection;