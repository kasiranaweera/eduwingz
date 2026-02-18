import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  Drawer,
  Grid,
  IconButton,
  Paper,
  Tooltip,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import uiConfigs from "../configs/ui.config";
import menuConfigs from "../configs/menu.configs";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SubjectIcon from "@mui/icons-material/Subject";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import HighlightIcon from "@mui/icons-material/Highlight";
import ChatSection from "../components/ChatSection";
import lessonsApi from "../api/modules/lessons.api";
import { MoreHorizOutlined, ShareOutlined } from "@mui/icons-material";

const PlatformLessonId = () => {
  const { appState } = useSelector((state) => state.appState);
  const { user } = useSelector((state) => state.user);
  const { lessonId } = useParams();
  const navigate = useNavigate();

  // State management
  const [lesson, setLesson] = useState(null);
  const [topics, setTopics] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // Drawer states
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [notesDrawerOpen, setNotesDrawerOpen] = useState(false);
  const [resourcesDrawerOpen, setResourcesDrawerOpen] = useState(false);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(500);
  const [isResizing, setIsResizing] = useState(false);

  // Edit mode state
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [editingResources, setEditingResources] = useState("");
  const [isGeneratingTopicContent, setIsGeneratingTopicContent] = useState(false);

  // Note creation state
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");

  const minWidth = 300;
  const maxWidth = 800;

  // Fetch lesson, topics, and notes on mount
  useEffect(() => {
    const fetchLessonData = async () => {
      if (!lessonId) {
        setLoading(false);
        navigate("/dashboard/platform/lessons");
        return;
      }

      try {
        setLoading(true);

        // Get lesson by UUID
        const { response: lessonData, err: lessonErr } =
          await lessonsApi.getLesson(lessonId);
        if (lessonErr) {
          setError("Lesson not found");
          setSnackbar({
            open: true,
            message: "Failed to load lesson",
            severity: "error",
          });
          setLoading(false);
          return;
        }

        setLesson(lessonData);

        // Get all topics for this lesson
        const { response: topicsData, err: topicsErr } =
          await lessonsApi.getTopics(lessonId);
        if (!topicsErr && topicsData) {
          setTopics(topicsData);
          if (topicsData.length > 0) {
            setSelectedTopic(topicsData[0]);
            setEditingContent(topicsData[0].content || "");
            setEditingResources(topicsData[0].resources || "");
          }
        }

        // Get all notes for this lesson
        const { response: notesData, err: notesErr } =
          await lessonsApi.getNotes(lessonId);
        if (!notesErr && notesData) {
          setNotes(notesData);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching lesson:", err);
        setError("An unexpected error occurred");
        setLoading(false);
      }
    };

    if (user) {
      fetchLessonData();
    } else {
      setLoading(false);
    }
  }, [lessonId, user, navigate]);

  // Handle topic selection
  const handleSelectTopic = (topic) => {
    setSelectedTopic(topic);
    setEditingContent(topic.content || "");
    setEditingResources(topic.resources || "");
  };

  const handleGenerateAndSaveContent = async () => {
    if (!selectedTopic) return;
    try {
      setIsGeneratingTopicContent(true);
      const { response, err } = await lessonsApi.generateTopicContent(selectedTopic.id, true);
      if (err || !response) {
        setSnackbar({ open: true, message: 'Failed to generate content', severity: 'error' });
      } else {
        const data = response.data || response;
        const content = data.content || '';
        // Update selectedTopic and topics list
        const updated = { ...selectedTopic, content };
        setSelectedTopic(updated);
        setTopics(topics.map((t) => (t.id === updated.id ? updated : t)));
        setSnackbar({ open: true, message: 'Content generated and saved', severity: 'success' });
      }
    } catch (e) {
      console.error('Generate content error', e);
      setSnackbar({ open: true, message: 'Error generating content', severity: 'error' });
    } finally {
      setIsGeneratingTopicContent(false);
    }
  };

  // Handle save topic
  const handleSaveTopic = async () => {
    if (!selectedTopic) return;

    try {
      const { response: updated, err } = await lessonsApi.updateTopic(
        selectedTopic.id,
        {
          content: editingContent,
          resources: editingResources,
        }
      );

      if (err) {
        setSnackbar({
          open: true,
          message: "Failed to update topic",
          severity: "error",
        });
        return;
      }

      setSelectedTopic(updated);
      setTopics(topics.map((t) => (t.id === updated.id ? updated : t)));
      setSnackbar({
        open: true,
        message: "Topic updated successfully",
        severity: "success",
      });
      setEditDrawerOpen(false);
    } catch (err) {
      console.error("Error updating topic:", err);
      setSnackbar({
        open: true,
        message: "Error updating topic",
        severity: "error",
      });
    }
  };

  // Formatting toolbar functions
  const wrapText = (prefix, suffix) => {
    const textarea = document.activeElement;
    if (textarea.name === "content") {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = editingContent.substring(start, end);
      const newContent =
        editingContent.substring(0, start) +
        prefix +
        selectedText +
        suffix +
        editingContent.substring(end);
      setEditingContent(newContent);
    } else if (textarea.name === "resources") {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = editingResources.substring(start, end);
      const newResources =
        editingResources.substring(0, start) +
        prefix +
        selectedText +
        suffix +
        editingResources.substring(end);
      setEditingResources(newResources);
    }
  };

  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  // Handle add note
  const handleAddNote = async (noteData) => {
    try {
      const { response: newNote, err } = await lessonsApi.addNote(
        lessonId,
        noteData
      );

      if (err) {
        setSnackbar({
          open: true,
          message: "Failed to add note",
          severity: "error",
        });
        return;
      }

      setNotes([newNote, ...notes]);
      setSnackbar({
        open: true,
        message: "Note added successfully",
        severity: "success",
      });
    } catch (err) {
      console.error("Error adding note:", err);
      setSnackbar({
        open: true,
        message: "Error adding note",
        severity: "error",
      });
    }
  };

  // Handle create and save new note
  const handleCreateNote = async () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) {
      setSnackbar({
        open: true,
        message: "Please fill in both title and content",
        severity: "warning",
      });
      return;
    }

    await handleAddNote({
      title: newNoteTitle,
      content: newNoteContent,
    });

    // Reset form
    setNewNoteTitle("");
    setNewNoteContent("");
    setNoteDialogOpen(false);
  };

  // Handle delete note
  const handleDeleteNote = async (noteId) => {
    try {
      const { err } = await lessonsApi.deleteNote(noteId);

      if (err) {
        setSnackbar({
          open: true,
          message: "Failed to delete note",
          severity: "error",
        });
        return;
      }

      setNotes(notes.filter((n) => n.id !== noteId));
      setSnackbar({ open: true, message: "Note deleted", severity: "success" });
    } catch (err) {
      console.error("Error deleting note:", err);
      setSnackbar({
        open: true,
        message: "Error deleting note",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;

      const containerWidth = window.innerWidth;
      const newWidth = containerWidth - e.clientX;

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setDrawerWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
    } else {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error && !lesson) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          action={
            <Button onClick={() => navigate("/dashboard/platform/lessons")}>
              Go Back
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  const handleBottomMenu = (index) => {
    if (index === 1) {
      setEditDrawerOpen((prev) => !prev);
    } else if (index === 2) {
      setNotesDrawerOpen((prev) => !prev);
    } else if (index === 3) {
      setResourcesDrawerOpen((prev) => !prev);
    } else if (index === 4) {
      setChatDrawerOpen((prev) => !prev);
    }
  };

  return (
    <>
      {/* Edit Drawer */}
      <Drawer
        sx={{
          width: editDrawerOpen ? drawerWidth : 0,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            backgroundColor: "background.paper",
            boxSizing: "border-box",
            transition: isResizing ? "none" : "width 0.3s ease",
          },
        }}
        variant="persistent"
        anchor="right"
        open={editDrawerOpen}
      >
        {/* Resize Handle */}
        <Box
          onMouseDown={handleMouseDown}
          sx={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "20px",
            cursor: "ew-resize",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1300,
            "&:hover": {
              "&::before": {
                bgcolor: "primary.main",
                opacity: 0.5,
              },
            },
            "&::before": {
              content: '""',
              position: "absolute",
              left: "0px",
              top: 0,
              bottom: 0,
              width: "1px",
              bgcolor: isResizing ? "primary.main" : "divider",
              borderRadius: 1,
              transition: "background-color 0.2s",
            },
          }}
        ></Box>

        {/* Drawer Content */}
        <Box sx={{ p: 3, mt: 8, overflowY: "auto", height: "100%", display: "flex", flexDirection: "column" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6">Edit Content</Typography>
            <IconButton onClick={() => setEditDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 3 }} />

          {selectedTopic ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Topic: {selectedTopic.title}
              </Typography>

              {/* Formatting Toolbar */}
              <Box>
                <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
                  Formatting Tools
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    p: 1,
                    borderRadius: 1,
                    border:1,
                    borderColor: "divider",
                  }}
                >
                  <Tooltip title="Bold">
                    <IconButton size="small" onClick={() => wrapText("**", "**")}>
                      <FormatBoldIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Italic">
                    <IconButton size="small" onClick={() => wrapText("*", "*")}>
                      <FormatItalicIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Underline">
                    <IconButton
                      size="small"
                      onClick={() => wrapText("<u>", "</u>")}
                    >
                      <FormatUnderlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Highlight">
                    <IconButton
                      size="small"
                      onClick={() => wrapText("<mark>", "</mark>")}
                    >
                      <HighlightIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Content Editor */}
              <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
                  Content
                </Typography>
                <TextField
                  name="content"
                  fullWidth
                  multiline
                  rows={10}
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  variant="outlined"
                  size="small"
                  placeholder="Enter topic content here..."
                  sx={{ 
                    mb: 3,
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "background.default",
                    }
                  }}
                />
              </Box>


              {/* Save Button */}
              <Button
                variant="contained"
                fullWidth
                startIcon={<SaveIcon />}
                onClick={handleSaveTopic}
                sx={{ mt: "auto" }}
              >
                Save Changes
              </Button>
            </Box>
          ) : (
            <Typography color="text.secondary">
              No topic selected. Select a topic from the list to edit.
            </Typography>
          )}
        </Box>
      </Drawer>

      {/* Notes Drawer */}
      <Drawer
        sx={{
          width: notesDrawerOpen ? drawerWidth : 0,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            backgroundColor: "background.paper",
            boxSizing: "border-box",
            transition: isResizing ? "none" : "width 0.3s ease",
          },
        }}
        variant="persistent"
        anchor="right"
        open={notesDrawerOpen}
      >
        {/* Resize Handle */}
        <Box
          onMouseDown={handleMouseDown}
          sx={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "20px",
            cursor: "ew-resize",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1300,
            "&:hover": {
              "&::before": {
                bgcolor: "primary.main",
                opacity: 0.5,
              },
            },
            "&::before": {
              content: '""',
              position: "absolute",
              left: "0px",
              top: 0,
              bottom: 0,
              width: "1px",
              bgcolor: isResizing ? "primary.main" : "divider",
              borderRadius: 1,
              transition: "background-color 0.2s",
            },
          }}
        ></Box>

        {/* Drawer Content */}
        <Box sx={{ p: 3, mt: 8, overflowY: "auto", height: "100%", display: "flex", flexDirection: "column" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">Notes ({notes.length})</Typography>
            <IconButton onClick={() => setNotesDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 3 }} />

          {/* Create Note Button */}
          <Button
            variant="contained"
            fullWidth
            onClick={() => setNoteDialogOpen(true)}
            sx={{ mb: 3 }}
          >
            + New Note
          </Button>

          {notes.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No notes yet. Create one to get started!
            </Typography>
          ) : (
            <Box sx={{ flex: 1, overflowY: "auto" }}>
              {notes.map((note, index) => (
                <Accordion key={note.id} defaultExpanded={index === 0}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <SubjectIcon sx={{ mr: 1 }} />
                    <Typography variant="subtitle2" noWrap>
                      {note.title || `Note ${index + 1}`}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box>
                      <Typography variant="body2">{note.content}</Typography>
                      {note.description && (
                        <Typography
                          variant="caption"
                          display="block"
                          sx={{ mt: 1, opacity: 0.7 }}
                        >
                          {note.description}
                        </Typography>
                      )}
                      <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                        <Button
                          size="small"
                          variant="text"
                          color="error"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}
        </Box>
      </Drawer>

      {/* Chat Drawer */}
      <Drawer
        sx={{
          width: chatDrawerOpen ? drawerWidth : 0,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            backgroundColor: "background.paper",
            boxSizing: "border-box",
            transition: isResizing ? "none" : "width 0.3s ease",
          },
        }}
        variant="persistent"
        anchor="right"
        open={chatDrawerOpen}
      >
        {/* Resize Handle */}
        <Box
          onMouseDown={handleMouseDown}
          sx={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "20px",
            cursor: "ew-resize",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1300,
            "&:hover": {
              "&::before": {
                bgcolor: "primary.main",
                opacity: 0.5,
              },
            },
            "&::before": {
              content: '""',
              position: "absolute",
              left: "0px",
              top: 0,
              bottom: 0,
              width: "1px",
              bgcolor: isResizing ? "primary.main" : "divider",
              borderRadius: 1,
              transition: "background-color 0.2s",
            },
          }}
        ></Box>

        {/* Drawer Content */}
        <Box sx={{ p: 3, mt: 8 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Chat Assistant</Typography>
            <IconButton onClick={() => setChatDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mt: 1, mb: 3 }} orientation="horizontal" flexItem />
          <Typography>{user.username} - Your learning assistant</Typography>

          <Box sx={{ mt: 3, p: 2, borderRadius: 2, border:1, borderColor: "divider" }}>
            <Typography variant="body2" color="text.secondary">
              💡 Drag the left edge to resize this panel
            </Typography>
          </Box>
          <ChatSection sx={{ position: "sticky", bottom: 0 }} />
        </Box>
      </Drawer>

      {/* Resources Drawer */}
      <Drawer
        sx={{
          width: resourcesDrawerOpen ? drawerWidth : 0,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            backgroundColor: "background.paper",
            boxSizing: "border-box",
            transition: isResizing ? "none" : "width 0.3s ease",
          },
        }}
        variant="persistent"
        anchor="right"
        open={resourcesDrawerOpen}
      >
        {/* Resize Handle */}
        <Box
          onMouseDown={handleMouseDown}
          sx={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "20px",
            cursor: "ew-resize",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1300,
            "&:hover": {
              "&::before": {
                bgcolor: "primary.main",
                opacity: 0.5,
              },
            },
            "&::before": {
              content: '""',
              position: "absolute",
              left: "0px",
              top: 0,
              bottom: 0,
              width: "1px",
              bgcolor: isResizing ? "primary.main" : "divider",
              borderRadius: 1,
              transition: "background-color 0.2s",
            },
          }}
        ></Box>

        {/* Drawer Content */}
        <Box sx={{ p: 3, mt: 8, overflowY: "auto", height: "100%" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Resources</Typography>
            <IconButton onClick={() => setResourcesDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mt: 1, mb: 3 }} />

          {selectedTopic ? (
            <>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>
                {selectedTopic.title}
              </Typography>

              {selectedTopic.resources ? (
                <Box>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                    {selectedTopic.resources}
                  </Typography>
                </Box>
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border:1,
                    borderColor: "divider",
                    textAlign: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No resources available for this topic yet.
                  </Typography>
                </Paper>
              )}
            </>
          ) : (
            <Typography color="text.secondary">
              Select a topic from the left sidebar to view its resources.
            </Typography>
          )}
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        sx={{
          width:
            editDrawerOpen || notesDrawerOpen || resourcesDrawerOpen || chatDrawerOpen
              ? `calc(100% - ${drawerWidth}px)`
              : "100%",
          transition: isResizing ? "none" : "width 0.3s ease",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              size="small"
              onClick={() => navigate("/dashboard/platform/lessons")}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5">{lesson?.title}</Typography>
          </Box>
          <Box sx={{ display: "flex", gap:1 }}>
            {editDrawerOpen ||
              notesDrawerOpen ||
              resourcesDrawerOpen ||
              (chatDrawerOpen && (
                <Button
                  sx={{
                    color: "primary.contrastText",
                    textTransform: "initial",
                    border: 1,
                    borderColor: "graycolor.two",
                    borderRadius:3,
                    px:3
                  }}
                >
                  Topics
                </Button>
              ))}
            <IconButton>
              <ShareOutlined />
            </IconButton>
            <IconButton>
              <MoreHorizOutlined />
            </IconButton>
          </Box>
        </Box>

        <Grid sx={{ mt: 2 }} container spacing={3}>
          {/* Sidebar - Topics */}
          {editDrawerOpen || notesDrawerOpen || resourcesDrawerOpen || chatDrawerOpen ? null : (
            <Grid item xs={12} size={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  border: 1,
                  borderColor: "graycolor.two",
                  borderRadius: 3,
                  maxHeight: "70vh",
                  overflowY: "auto",
                }}
              >
                <Typography variant="h6">Topics ({topics.length})</Typography>
                <Divider
                  sx={{ mt: 1, mb: 3 }}
                  orientation="horizontal"
                  flexItem
                />

                {topics.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No topics yet.
                  </Typography>
                ) : (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    {topics.map((topic, index) => (
                      <Paper
                        key={topic.id}
                        elevation={selectedTopic?.id === topic.id ? 2 : 0}
                        sx={{
                          p: 2,
                          border: 1,
                          borderColor:
                            selectedTopic?.id === topic.id
                              ? "primary.main"
                              : "divider",
                          borderRadius: 2,
                          cursor: "pointer",
                          backgroundColor:
                            selectedTopic?.id === topic.id
                              ? "action.selected"
                              : "transparent",
                          transition: "all 0.2s",
                          "&:hover": {
                            backgroundColor: "action.hover",
                            borderColor: "primary.main",
                          },
                        }}
                        onClick={() => handleSelectTopic(topic)}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ overflow: 'hidden' }}>
                            <Typography variant="subtitle2" noWrap>
                              {index + 1}. {topic.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {topic.content?.substring(0, 30)}...
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>
          )}

          {/* Main Content */}
          <Grid
            item
            xs={12}
            size={editDrawerOpen || notesDrawerOpen || resourcesDrawerOpen || chatDrawerOpen ? 12 : 9}
            container
            direction="column"
            spacing={3}
          >
            {selectedTopic ? (
              <>
                {/* Content Section */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    border: 1,
                    borderColor: "graycolor.two",
                    borderRadius: 3,
                  }}
                >
                  <Typography variant="h6">Content</Typography>
                  <Divider
                    sx={{ mt: 1, mb: 2 }}
                    orientation="horizontal"
                    flexItem
                  />
                  <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                    {selectedTopic.content}
                  </Typography>
                  {/* If no content, show generate button */}
                {!selectedTopic.content && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      border: 1,
                      borderColor: "graycolor.two",
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">No content yet for this topic.</Typography>
                    <Button variant="contained" onClick={handleGenerateAndSaveContent} disabled={isGeneratingTopicContent}>
                      {isGeneratingTopicContent ? (<CircularProgress size={20} color="inherit" />) : 'Generate content'}
                    </Button>
                  </Paper>
                )}
                </Paper>

                
              </>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  border: 1,
                  borderColor: "graycolor.two",
                  borderRadius: 3,
                  textAlign: "center",
                }}
              >
                <Typography color="text.secondary">
                  Select a topic from the left sidebar to view its content
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Box>

      {/* Fixed Menu Bar */}
      <Box
        sx={{
          position: "fixed",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1200,
        }}
      >
        <Box
          sx={{
            backgroundColor: "background.paper",
            p: 1,
            borderRadius: 3,
            gap: 1,
            display: "inline-flex",
            alignItems: "end",
            boxShadow: 3,
          }}
        >
          {menuConfigs.platformMenu.map((item, index) => (
            <Box
              key={index}
              sx={{
                transition: "transform 0.2s",
                "&:hover": { transform: "translateY(-4px) scale(1.1)" },
              }}
            >
              <Tooltip title={item.display} placement="top" arrow>
                <IconButton
                  onClick={() => handleBottomMenu(index)}
                  size="large"
                  sx={{
                    border: 1,
                    borderColor: "graycolor.two",
                    "&:hover": {
                      color: appState.includes(item.state)
                        ? "secondary.contrastText"
                        : "primary.main",
                    },
                    color: appState.includes(item.state)
                      ? "secondary.contrastText"
                      : "primary.contrastText",
                    background: appState.includes(item.state)
                      ? uiConfigs.style.mainGradient.color
                      : "none",
                  }}
                >
                  {item.icon}
                </IconButton>
              </Tooltip>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Snackbar for notifications */}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>

      {/* Create Note Dialog */}
      <Dialog open={noteDialogOpen} onClose={() => setNoteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Note</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              autoFocus
              label="Note Title"
              fullWidth
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              placeholder="Enter note title..."
            />
            <TextField
              label="Note Content"
              fullWidth
              multiline
              rows={6}
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Enter note content..."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateNote}
            variant="contained"
          >
            Create Note
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PlatformLessonId;
