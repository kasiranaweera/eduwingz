import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  Grid,
  IconButton,
  Paper,
  Tooltip,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SubjectIcon from "@mui/icons-material/Subject";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import HighlightIcon from "@mui/icons-material/Highlight";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import CodeIcon from "@mui/icons-material/Code";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import FormatStrikethroughIcon from "@mui/icons-material/FormatStrikethrough";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AttachmentIcon from "@mui/icons-material/Attachment";
import { ShareOutlined, MoreHorizOutlined, GroupOutlined } from "@mui/icons-material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ChatSection from "../components/ChatSection";
import lessonsApi from "../api/modules/lessons.api";
import chatApi from "../api/modules/chat.api";
import privateClient from "../api/client/private.client"; // ADDED
import PlatformBottomNav from "../components/PlatformBottomNav";

// ─── Formatting toolbar helper ────────────────────────────────────────────────
const FormattingToolbar = ({ textareaRef, value, onChange, compact = false }) => {
  const wrapText = (prefix, suffix = "") => {
    const el = textareaRef?.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.substring(start, end);
    const newVal =
      value.substring(0, start) + prefix + selected + suffix + value.substring(end);
    onChange(newVal);
    // re-focus & restore selection
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(
        start + prefix.length,
        end + prefix.length
      );
    });
  };

  const btnSize = compact ? "small" : "small";
  const tools = [
    { title: "Bold", action: () => wrapText("**", "**"), icon: <FormatBoldIcon fontSize={btnSize} /> },
    { title: "Italic", action: () => wrapText("*", "*"), icon: <FormatItalicIcon fontSize={btnSize} /> },
    { title: "Underline", action: () => wrapText("<u>", "</u>"), icon: <FormatUnderlinedIcon fontSize={btnSize} /> },
    { title: "Strikethrough", action: () => wrapText("~~", "~~"), icon: <FormatStrikethroughIcon fontSize={btnSize} /> },
    { title: "Highlight ★", action: () => wrapText('<mark style="background-color:yellow">', "</mark>"), icon: <HighlightIcon fontSize={btnSize} sx={{ color: "#f9c74f" }} /> },
    { title: "Highlight ✦", action: () => wrapText('<mark style="background-color:#90ee90">', "</mark>"), icon: <HighlightIcon fontSize={btnSize} sx={{ color: "#52b788" }} /> },
    { title: "Bullet List", action: () => wrapText("\n- ", ""), icon: <FormatListBulletedIcon fontSize={btnSize} /> },
    { title: "Code", action: () => wrapText("`", "`"), icon: <CodeIcon fontSize={btnSize} /> },
    { title: "Link", action: () => wrapText("[", "](url)"), icon: <InsertLinkIcon fontSize={btnSize} /> },
    { title: "Image", action: () => wrapText("![alt text](", "image_url)"), icon: <InsertLinkIcon fontSize={btnSize} /> }, // Can replace with better icon
    { title: "Embed Video/Lab", action: () => wrapText('<iframe width="560" height="315" src="', 'video_or_lab_url" frameborder="0" allowfullscreen></iframe>'), icon: <CodeIcon fontSize={btnSize} sx={{ color: "primary.main" }} /> },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 0.25,
        p: 0.75,
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        bgcolor: "background.default",
      }}
    >
      {tools.map((t) => (
        <Tooltip key={t.title} title={t.title} placement="top" arrow>
          <IconButton size="small" onClick={t.action} sx={{ borderRadius: 1.5 }}>
            {t.icon}
          </IconButton>
        </Tooltip>
      ))}
    </Box>
  );
};

// ─── Resize handle ────────────────────────────────────────────────────────────
const ResizeHandle = ({ onMouseDown, isResizing }) => (
  <Box
    onMouseDown={onMouseDown}
    sx={{
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: "16px",
      cursor: "ew-resize",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1,
      "&::before": {
        content: '""',
        position: "absolute",
        left: "7px",
        top: "20%",
        bottom: "20%",
        width: "2px",
        bgcolor: isResizing ? "primary.main" : "divider",
        borderRadius: 2,
        transition: "background-color 0.2s",
      },
      "&:hover::before": { bgcolor: "primary.main" },
    }}
  />
);

// ─── Panel header ─────────────────────────────────────────────────────────────
const PanelHeader = ({ title, subtitle, onClose, extraAction }) => (
  <Box sx={{ px: 3, pt: 3, pb: 2, borderBottom: 1, borderColor: "divider" }}>
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Box>
        <Typography variant="h6" fontWeight={700}>{title}</Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
        )}
      </Box>
      <Box sx={{ display: "flex", gap: 0.5 }}>
        {extraAction}
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  </Box>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const PlatformLessonId = () => {
  const { user } = useSelector((state) => state.user);
  const { lessonId } = useParams();
  const navigate = useNavigate();

  // ── Data state ──────────────────────────────────────────────────────────────
  const [lesson, setLesson] = useState(null);
  const [topics, setTopics] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  // ── Panel state ──────────────────────────────────────────────────────────────
  // null = closed, 1 = Edit, 2 = Notes, 3 = Resources, 4 = Mini Chat
  const [activePanel, setActivePanel] = useState(null);
  const [drawerWidth, setDrawerWidth] = useState(480);
  const [isResizing, setIsResizing] = useState(false);

  // ── Chat expand state ────────────────────────────────────────────────────────
  const [chatExpanded, setChatExpanded] = useState(false);

  // ── Topic / edit state ───────────────────────────────────────────────────────
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [isGeneratingTopicContent, setIsGeneratingTopicContent] = useState(false);

  // ── Notes state ───────────────────────────────────────────────────────────────
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteTitle, setEditingNoteTitle] = useState("");
  const [editingNoteContent, setEditingNoteContent] = useState("");

  // ── Mini Chat state ───────────────────────────────────────────────────────────
  const [miniChatSessionId, setMiniChatSessionId] = useState(null);

  // ── Discussions state ─────────────────────────────────────────────────────────
  const [discussions, setDiscussions] = useState([]);
  const [newDiscussionContent, setNewDiscussionContent] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);

  // ── Modality Formatting state ───────────────────────────────────────────────
  const [contentFormat, setContentFormat] = useState("text"); // "text", "mindmap", "audio"
  const [topicCodeCache, setTopicCodeCache] = useState({}); // { topicId: { mindmap: "...", audioUrl: "...", script: "..." } }
  const [isAdapting, setIsAdapting] = useState(false);

  // ── Refs for formatting toolbar ───────────────────────────────────────────────
  const editContentRef = useRef(null);
  const newNoteContentRef = useRef(null);
  const editNoteContentRef = useRef(null);
  const mermaidRef = useRef(null);

  const minWidth = 320;
  const maxWidth = 860;

  // ── Fetch data ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchLessonData = async () => {
      if (!lessonId) { setLoading(false); navigate("/dashboard/platform/lessons"); return; }
      try {
        setLoading(true);
        const { response: lessonData, err: lessonErr } = await lessonsApi.getLesson(lessonId);
        if (lessonErr) {
          setError("Lesson not found");
          setSnackbar({ open: true, message: "Failed to load lesson", severity: "error" });
          setLoading(false);
          return;
        }
        setLesson(lessonData);

        const { response: topicsData } = await lessonsApi.getTopics(lessonId);
        if (topicsData) {
          setTopics(topicsData);
          if (topicsData.length > 0) {
            handleSelectTopic(topicsData[0]);
          }
        }

        const { response: notesData } = await lessonsApi.getNotes(lessonId);
        if (notesData) setNotes(notesData);
      } catch (err) {
        console.error("Error fetching lesson:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchLessonData();
    else setLoading(false);
  }, [lessonId, user, navigate]);

  // ── Resize logic ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= minWidth && newWidth <= maxWidth) setDrawerWidth(newWidth);
    };
    const handleMouseUp = () => { setIsResizing(false); };
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

  // ── Handlers ───────────────────────────────────────────────────────────────────
  const handleSelectTopic = async (topic) => {
    setSelectedTopic(topic);
    setEditingContent(topic.content || "");
    setContentFormat("text"); // Reset view to text on load

    // Load discussions for this topic
    try {
      const { response: discData } = await lessonsApi.getTopicDiscussions(topic.id);
      if (discData) {
        setDiscussions(discData);
      }
    } catch (err) {
      console.error("Failed to load discussions", err);
    }
  };

  const handleBottomMenu = (index) => {
    // Toggle: clicking active panel closes it
    if (activePanel === index) {
      setActivePanel(null);
    } else {
      setActivePanel(index);
    }
  };

  const handleSaveTopic = async () => {
    if (!selectedTopic) return;
    try {
      const { response: updated, err } = await lessonsApi.partialUpdateTopic(selectedTopic.id, {
        content: editingContent,
      });
      if (err) { setSnackbar({ open: true, message: "Failed to update topic", severity: "error" }); return; }
      const updatedTopic = updated || { ...selectedTopic, content: editingContent };
      setSelectedTopic(updatedTopic);
      setTopics(topics.map((t) => (t.id === updatedTopic.id ? updatedTopic : t)));
      setSnackbar({ open: true, message: "Topic updated successfully", severity: "success" });
    } catch (err) {
      setSnackbar({ open: true, message: "Error updating topic", severity: "error" });
    }
  };

  const handleGenerateAndSaveContent = async () => {
    if (!selectedTopic) return;
    try {
      setIsGeneratingTopicContent(true);
      const { response, err } = await lessonsApi.generateTopicContent(selectedTopic.id, true);
      if (err || !response) {
        setSnackbar({ open: true, message: "Failed to generate content", severity: "error" });
      } else {
        // privateClient already returns response.data — response IS the data object
        const content = response.content || response.data?.content || "";
        const updated = { ...selectedTopic, content };
        setSelectedTopic(updated);
        setEditingContent(content);
        setTopics(topics.map((t) => (t.id === updated.id ? updated : t)));
        setSnackbar({ open: true, message: "Content generated and saved", severity: "success" });
      }
    } finally {
      setIsGeneratingTopicContent(false);
    }
  };

  const handleFormatChange = async (event, newFormat) => {
    if (newFormat !== null) {
      setContentFormat(newFormat);

      // If asking for a non-text format, and we haven't generated it yet...
      if (newFormat !== "text" && selectedTopic?.content) {
        const cache = topicCodeCache[selectedTopic.id] || {};
        if (newFormat === "mindmap" && !cache.mindmapCode) {
          await adaptTopicContent("mindmap");
        } else if (newFormat === "audio" && !cache.audioUrl) {
          await adaptTopicContent("audio");
        }
      }
    }
  };

  const adaptTopicContent = async (format) => {
    try {
      setIsAdapting(true);
      // Fast API is exposed via a custom path or through the django proxy.
      // We'll directly hit the proxy to FastAPI logic via standard fetch or client setup.
      // Easiest is to use the existing private client pointing directly at FastAPI if available, or through proxy.
      const payload = {
        topic_title: selectedTopic.title,
        text_content: selectedTopic.content,
        format: format
      };

      // Try hitting the Django proxy or the FastAPI direct url
      // For this step we will assume the frontend makes a direct call to the fastapi equivalent endpoint
      // via the privateClient. We'll manually construct it since it's an edge API case.

      // Make direct request to the FastAPI endpoint mapping in the backend
      const response = await privateClient.post("fastapi/api/lessons/adapt_content", payload);

      const newCache = { ...topicCodeCache };
      if (!newCache[selectedTopic.id]) {
        newCache[selectedTopic.id] = {};
      }

      if (format === "mindmap") {
        newCache[selectedTopic.id].mindmapCode = response.content;
      } else if (format === "audio") {
        newCache[selectedTopic.id].audioUrl = response.audio_url;
        newCache[selectedTopic.id].script = response.script;
      }

      setTopicCodeCache(newCache);
    } catch (err) {
      console.error("Error adapting topic", err);
      // Reset format on error
      setContentFormat("text");
      setSnackbar({ open: true, message: "Engine failed to format this content adaptively.", severity: "warning" });
    } finally {
      setIsAdapting(false);
    }
  };

  // Render mermaid function
  useEffect(() => {
    if (contentFormat === "mindmap" && selectedTopic && mermaidRef.current) {
      const cache = topicCodeCache[selectedTopic.id];
      if (cache?.mindmapCode) {
        import("mermaid").then((mermaidModule) => {
          const mermaid = mermaidModule.default;
          mermaid.initialize({ startOnLoad: false, theme: 'base' });
          mermaid.render(`mermaid-${selectedTopic.id}`, cache.mindmapCode).then((rendered) => {
            if (mermaidRef.current) {
              mermaidRef.current.innerHTML = rendered.svg;
            }
          }).catch(err => {
            console.error("Mermaid parsing error:", err);
            if (mermaidRef.current) {
              mermaidRef.current.innerHTML = "<p>Mind map generation was too complex. Try standard view.</p>";
            }
          });
        }).catch(e => {
          console.error("Mermaid failed to load", e);
        });
      }
    }
  }, [contentFormat, selectedTopic, topicCodeCache]);

  // Notes handlers
  const handleCreateNote = async () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) {
      setSnackbar({ open: true, message: "Please fill in title and content", severity: "warning" });
      return;
    }
    try {
      const { response: newNote, err } = await lessonsApi.addNote(lessonId, {
        title: newNoteTitle,
        content: newNoteContent,
      });
      if (err) { setSnackbar({ open: true, message: "Failed to add note", severity: "error" }); return; }
      setNotes([newNote, ...notes]);
      setNewNoteTitle("");
      setNewNoteContent("");
      setShowNoteForm(false);
      setSnackbar({ open: true, message: "Note added", severity: "success" });
    } catch {
      setSnackbar({ open: true, message: "Error adding note", severity: "error" });
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const { err } = await lessonsApi.deleteNote(noteId);
      if (err) { setSnackbar({ open: true, message: "Failed to delete note", severity: "error" }); return; }
      setNotes(notes.filter((n) => n.id !== noteId));
      setSnackbar({ open: true, message: "Note deleted", severity: "info" });
    } catch {
      setSnackbar({ open: true, message: "Error deleting note", severity: "error" });
    }
  };

  const handleStartEditNote = (note) => {
    setEditingNoteId(note.id);
    setEditingNoteTitle(note.title || "");
    setEditingNoteContent(note.content || "");
  };

  const handleSaveEditNote = async () => {
    if (!editingNoteId) return;
    try {
      const { response: updated, err } = await lessonsApi.updateNote
        ? await lessonsApi.updateNote(editingNoteId, { title: editingNoteTitle, content: editingNoteContent })
        : { response: null, err: null };
      if (!err && updated) {
        setNotes(notes.map((n) => (n.id === editingNoteId ? updated : n)));
        setSnackbar({ open: true, message: "Note updated", severity: "success" });
      } else {
        // Optimistic local update if API missing
        setNotes(notes.map((n) =>
          n.id === editingNoteId
            ? { ...n, title: editingNoteTitle, content: editingNoteContent }
            : n
        ));
        setSnackbar({ open: true, message: "Note updated locally", severity: "info" });
      }
      setEditingNoteId(null);
    } catch {
      setSnackbar({ open: true, message: "Error updating note", severity: "error" });
    }
  };

  // Mini Chat
  const handleRedirectToFullChat = () => {
    if (!selectedTopic) return;
    navigate("/dashboard/chat/new", {
      state: {
        initialMessage: `I'm learning about "${selectedTopic.title}" in the lesson "${lesson?.title}". Can you help me understand: \n\n${selectedTopic.content?.substring(0, 500)}...`,
        autoSend: false,
      },
    });
  };

  const handleMiniChatSendMessage = async (content) => {
    if (!content.trim()) return false;
    try {
      let sessionId = miniChatSessionId;
      if (!sessionId) {
        const { response, err } = await chatApi.createSession({
          title: `Mini Chat: ${selectedTopic?.title || "Lesson Help"}`,
        });
        if (err || !response) throw err || new Error("Failed to create session");
        sessionId = response.id;
        setMiniChatSessionId(sessionId);
      }
      const contextPrefix = miniChatSessionId ? "" :
        `[SYSTEM: Provide only clarifications about lesson content. Do NOT answer quiz or assignment questions.]\n\n`;
      const { err: msgErr } = await chatApi.postMessage(sessionId, {
        content: contextPrefix + content,
        document_ids: [],
      });
      if (msgErr) throw msgErr;
      return true;
    } catch (err) {
      console.error("Mini Chat Error:", err);
      setSnackbar({ open: true, message: "Mini Chat failed to send", severity: "error" });
      return false;
    } finally {
      // isMiniChatLoading removed
    }
  };

  // Discussions
  const handlePostDiscussion = async () => {
    if (!newDiscussionContent.trim() || !selectedTopic) return;
    try {
      const { err } = await lessonsApi.addTopicDiscussion({
        topicId: selectedTopic.id,
        content: newDiscussionContent,
        parentId: replyingTo
      });
      if (err) throw err;

      setSnackbar({ open: true, message: "Posted successfully", severity: "success" });
      setNewDiscussionContent("");
      setReplyingTo(null);

      // Refresh discussions
      const { response: discData } = await lessonsApi.getTopicDiscussions(selectedTopic.id);
      if (discData) {
        setDiscussions(discData);
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Failed to post comment", severity: "error" });
    }
  };

  // ── Early returns ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !lesson) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          action={<Button onClick={() => navigate("/dashboard/platform/lessons")}>Go Back</Button>}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  const panelOpen = activePanel !== null;

  // ────────────────────────────────────────────────────────────────────────────
  // Panel content renderers
  // ────────────────────────────────────────────────────────────────────────────

  const renderEditPanel = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, flex: 1 }}>
      {selectedTopic ? (
        <>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Chip label={selectedTopic.title} size="small" color="primary" variant="outlined" />
          </Box>

          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              Formatting Tools
            </Typography>
            <FormattingToolbar
              textareaRef={editContentRef}
              value={editingContent}
              onChange={setEditingContent}
            />
          </Box>

          <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              Content
            </Typography>
            <TextField
              inputRef={editContentRef}
              name="edit-content"
              fullWidth
              multiline
              minRows={12}
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              variant="outlined"
              size="small"
              placeholder="Write or edit the topic content here…"
              sx={{ "& .MuiOutlinedInput-root": { bgcolor: "background.default", borderRadius: 2 } }}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              onClick={handleGenerateAndSaveContent}
              disabled={isGeneratingTopicContent}
              sx={{ flex: 1 }}
            >
              {isGeneratingTopicContent ? <CircularProgress size={18} color="inherit" /> : "✨ Generate"}
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveTopic}
              sx={{ flex: 1 }}
            >
              Save
            </Button>
          </Box>
        </>
      ) : (
        <Typography color="text.secondary">
          Select a topic from the sidebar to start editing.
        </Typography>
      )}
    </Box>
  );

  const renderNotesPanel = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
      {/* New Note Toggle Button */}
      {!showNoteForm ? (
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setShowNoteForm(true)}
          fullWidth
        >
          New Note
        </Button>
      ) : (
        <Paper
          elevation={0}
          sx={{ p: 2, border: 1, borderColor: "primary.main", borderRadius: 2, bgcolor: "background.default" }}
        >
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
            New Note
          </Typography>
          <TextField
            label="Title"
            fullWidth
            size="small"
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
            sx={{ mb: 1.5 }}
          />
          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
              Formatting
            </Typography>
            <FormattingToolbar
              textareaRef={newNoteContentRef}
              value={newNoteContent}
              onChange={setNewNoteContent}
              compact
            />
          </Box>
          <TextField
            inputRef={newNoteContentRef}
            name="new-note-content"
            label="Content"
            fullWidth
            multiline
            minRows={5}
            size="small"
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="Write your note here…"
            sx={{ mb: 1.5 }}
          />
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button size="small" onClick={() => { setShowNoteForm(false); setNewNoteTitle(""); setNewNoteContent(""); }} sx={{ flex: 1 }}>
              Cancel
            </Button>
            <Button size="small" variant="contained" onClick={handleCreateNote} sx={{ flex: 1 }}>
              Add Note
            </Button>
          </Box>
        </Paper>
      )}

      <Divider />

      {/* Notes list */}
      {notes.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 3 }}>
          <Typography variant="body2" color="text.secondary">
            No notes yet. Create your first note above!
          </Typography>
        </Box>
      ) : (
        <Box sx={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            {notes.length} Note{notes.length !== 1 ? "s" : ""}
          </Typography>
          {notes.map((note, index) => (
            <Accordion
              key={note.id}
              disableGutters
              elevation={0}
              sx={{ border: 1, borderColor: "divider", borderRadius: "8px !important", "&:before": { display: "none" } }}
              defaultExpanded={index === 0}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 48 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, overflow: "hidden" }}>
                  <SubjectIcon sx={{ fontSize: 16, color: "primary.main", flexShrink: 0 }} />
                  <Typography variant="subtitle2" noWrap>
                    {note.title || `Note ${index + 1}`}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                {editingNoteId === note.id ? (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <TextField
                      label="Title"
                      fullWidth
                      size="small"
                      value={editingNoteTitle}
                      onChange={(e) => setEditingNoteTitle(e.target.value)}
                    />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
                        Formatting
                      </Typography>
                      <FormattingToolbar
                        textareaRef={editNoteContentRef}
                        value={editingNoteContent}
                        onChange={setEditingNoteContent}
                        compact
                      />
                    </Box>
                    <TextField
                      inputRef={editNoteContentRef}
                      name="edit-note-content"
                      label="Content"
                      fullWidth
                      multiline
                      minRows={4}
                      size="small"
                      value={editingNoteContent}
                      onChange={(e) => setEditingNoteContent(e.target.value)}
                    />
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button size="small" onClick={() => setEditingNoteId(null)} sx={{ flex: 1 }}>Cancel</Button>
                      <Button size="small" variant="contained" onClick={handleSaveEditNote} sx={{ flex: 1 }}>Save</Button>
                    </Box>
                  </Box>
                ) : (
                  <>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mb: 1.5 }}>
                      {note.content}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<EditOutlinedIcon />}
                        onClick={() => handleStartEditNote(note)}
                        sx={{ flex: 1 }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteOutlineIcon />}
                        onClick={() => handleDeleteNote(note.id)}
                        sx={{ flex: 1 }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Box>
  );

  const renderResourcesPanel = () => (
    <Box sx={{ flex: 1, overflowY: "auto" }}>
      {selectedTopic ? (
        <>
          <Chip label={selectedTopic.title} size="small" color="primary" variant="outlined" sx={{ mb: 2 }} />
          {selectedTopic.resources ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {selectedTopic.resources
                .split("\n")
                .filter((r) => r.trim())
                .map((res, i) => {
                  const urlMatch = res.match(/https?:\/\/[^\s]+/);
                  const label = res.replace(/https?:\/\/[^\s]+/, "").trim() || `Resource ${i + 1}`;
                  return (
                    <Card
                      key={i}
                      variant="outlined"
                      sx={{
                        cursor: "pointer",
                        borderRadius: 2,
                        transition: "all 0.15s",
                        "&:hover": { borderColor: "primary.main", bgcolor: "action.hover", transform: "translateX(2px)" },
                      }}
                      onClick={() => window.open(urlMatch ? urlMatch[0] : "#", "_blank")}
                    >
                      <CardContent sx={{ p: "12px !important" }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <Typography variant="body2" noWrap sx={{ maxWidth: "82%" }}>
                            {label}
                          </Typography>
                          <OpenInNewIcon fontSize="small" color="action" />
                        </Box>
                        {urlMatch && (
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block", mt: 0.25 }}>
                            {urlMatch[0]}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
            </Box>
          ) : (
            <Paper
              elevation={0}
              sx={{ p: 3, borderRadius: 2, border: 1, borderColor: "divider", textAlign: "center" }}
            >
              <AttachmentIcon sx={{ fontSize: 36, color: "text.disabled", mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No resources available for this topic yet.
              </Typography>
              <Typography variant="caption" color="text.disabled">
                Use the Edit panel to add resource links to this topic.
              </Typography>
            </Paper>
          )}
        </>
      ) : (
        <Typography color="text.secondary">
          Select a topic from the sidebar to see its resources.
        </Typography>
      )}
    </Box>
  );

  const MiniChatContent = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
      {/* Clarification notice */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2,
          border: 1,
          borderColor: "warning.main",
          bgcolor: "warning.main",
          backgroundImage: "none",
          opacity: 0.85,
        }}
      >
        <Typography variant="body2" sx={{ color: "warning.contrastText", fontWeight: 600 }}>
          💡 Clarification Only Mode
        </Typography>
        <Typography variant="caption" sx={{ color: "warning.contrastText" }}>
          This assistant only provides explanations and clarifications for lesson content.
          It will NOT answer quiz or assignment questions directly.
        </Typography>
      </Paper>

      {/* Redirect to full chat */}
      <Button
        variant="outlined"
        fullWidth
        size="small"
        endIcon={<OpenInNewIcon />}
        onClick={handleRedirectToFullChat}
      >
        Open in Full Chat Platform
      </Button>

      {/* Chat input */}
      <Box sx={{ flex: 1 }}>
        <ChatSection
          handleSendMessage={handleMiniChatSendMessage}
        />
      </Box>
    </Box>
  );

  const renderDiscussionsPanel = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
      {selectedTopic ? (
        <>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              {replyingTo ? "Replying to comment..." : "Start a discussion"}
            </Typography>
            <TextField
              fullWidth
              multiline
              minRows={2}
              size="small"
              placeholder="Ask a question or share your thoughts..."
              value={newDiscussionContent}
              onChange={(e) => setNewDiscussionContent(e.target.value)}
              sx={{ mb: 1, bgcolor: "background.default", borderRadius: 1 }}
            />
            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
              {replyingTo && (
                <Button size="small" onClick={() => setReplyingTo(null)}>Cancel</Button>
              )}
              <Button
                variant="contained"
                size="small"
                onClick={handlePostDiscussion}
                disabled={!newDiscussionContent.trim()}
              >
                Post
              </Button>
            </Box>
          </Box>

          <Divider />

          {discussions.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <GroupOutlined sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
              <Typography color="text.secondary" variant="body2">
                No discussions yet. Be the first to start!
              </Typography>
            </Box>
          ) : (
            <Box sx={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
              {discussions.map((disc) => (
                <Box key={disc.id} sx={{ p: 2, bgcolor: "background.default", borderRadius: 2, border: 1, borderColor: "divider" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="subtitle2" color="primary.main">
                      {disc.user_name || disc.user_email || "User"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(disc.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mb: 2 }}>
                    {disc.content}
                  </Typography>

                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button size="small" variant="text" onClick={() => setReplyingTo(disc.id)}>Reply</Button>
                  </Box>

                  {/* Nested replies */}
                  {disc.replies && disc.replies.length > 0 && (
                    <Box sx={{ mt: 2, pl: 2, borderLeft: 2, borderColor: "divider", display: "flex", flexDirection: "column", gap: 1 }}>
                      {disc.replies.map((reply) => (
                        <Box key={reply.id} sx={{ p: 1.5, bgcolor: "action.hover", borderRadius: 2 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                            <Typography variant="caption" fontWeight={600}>
                              {reply.user_name || reply.user_email || "User"}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                            {reply.content}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </>
      ) : (
        <Typography color="text.secondary">
          Select a topic from the sidebar to view discussions.
        </Typography>
      )}
    </Box>
  );

  const panelTitles = {
    1: { title: "Edit Content", subtitle: selectedTopic?.title },
    2: { title: "My Notes", subtitle: `${notes.length} note${notes.length !== 1 ? "s" : ""}` },
    3: { title: "Resources", subtitle: selectedTopic?.title },
    4: { title: "Lesson Chat", subtitle: "Clarification mode" },
    5: { title: "Peer Discussion", subtitle: selectedTopic?.title },
  };

  const currentPanelMeta = panelTitles[activePanel] || {};

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Right-side Drawer (unified) ─────────────────────────────────────── */}
      <Drawer
        sx={{
          width: panelOpen ? drawerWidth : 0,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            mt: 8,
            backgroundColor: "background.paper",
            boxSizing: "border-box",
            transition: isResizing ? "none" : "width 0.3s ease",
            display: "flex",
            flexDirection: "column",
          },
        }}
        variant="persistent"
        anchor="right"
        open={panelOpen}
      >
        <ResizeHandle onMouseDown={(e) => { setIsResizing(true); e.preventDefault(); }} isResizing={isResizing} />

        <PanelHeader
          title={currentPanelMeta.title}
          subtitle={currentPanelMeta.subtitle}
          onClose={() => setActivePanel(null)}
          extraAction={
            activePanel === 4 ? (
              <Tooltip title="Expand to popup">
                <IconButton size="small" onClick={() => setChatExpanded(true)}>
                  <OpenInFullIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : null
          }
        />

        {/* Panel body */}
        <Box sx={{ flex: 1, overflowY: "auto", p: 3, mt: 8, display: "flex", flexDirection: "column" }}>
          {activePanel === 1 && renderEditPanel()}
          {activePanel === 2 && renderNotesPanel()}
          {activePanel === 3 && renderResourcesPanel()}
          {activePanel === 4 && <MiniChatContent />}
          {activePanel === 5 && renderDiscussionsPanel()}
        </Box>
      </Drawer>

      {/* ── Chat expanded popup ─────────────────────────────────────────────── */}
      <Dialog
        open={chatExpanded}
        onClose={() => setChatExpanded(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 3,
            minHeight: "80vh",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>Lesson Chat Assistant</Typography>
            {selectedTopic && (
              <Typography variant="caption" color="text.secondary">
                {lesson?.title} — {selectedTopic.title}
              </Typography>
            )}
          </Box>
          <IconButton onClick={() => setChatExpanded(false)}>
            <CloseFullscreenIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: 1,
              borderColor: "warning.light",
              bgcolor: "warning.light",
            }}
          >
            <Typography variant="body2" fontWeight={600} color="warning.dark">
              💡 Clarification Only Mode
            </Typography>
            <Typography variant="caption" color="warning.dark">
              This assistant only explains lesson concepts. It will not solve quizzes or assignments.
            </Typography>
          </Paper>

          <Button
            variant="outlined"
            size="small"
            endIcon={<OpenInNewIcon />}
            onClick={() => { setChatExpanded(false); handleRedirectToFullChat(); }}
            sx={{ alignSelf: "flex-start" }}
          >
            Switch to Full Chat Platform
          </Button>

          <Box sx={{ flex: 1 }}>
            <ChatSection handleSendMessage={handleMiniChatSendMessage} />
          </Box>
        </DialogContent>
      </Dialog>

      {/* ── Main layout ─────────────────────────────────────────────────────── */}
      <Box
        sx={{
          width: panelOpen ? `calc(100% - ${drawerWidth}px)` : "100%",
          transition: isResizing ? "none" : "width 0.3s ease",
          pb: 14,
        }}
      >
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton size="small" onClick={() => navigate("/dashboard/platform/lessons")}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" fontWeight={700}>
              {lesson?.title}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton><ShareOutlined /></IconButton>
            <IconButton><MoreHorizOutlined /></IconButton>
          </Box>
        </Box>

        {/* 2-column layout */}
        <Grid container spacing={3} sx={{ mt: 0 }}>
          {/* ── Topics sidebar ─────────────────────────────────────────────── */}
          <Grid item xs={12} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                border: 1,
                borderColor: "divider",
                borderRadius: 3,
                maxHeight: "70vh",
                overflowY: "auto",
                position: "sticky",
                top: 80,
              }}
            >
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                Topics ({topics.length})
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {topics.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No topics yet.</Typography>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {topics.map((topic, i) => {
                    const isSelected = selectedTopic?.id === topic.id;
                    return (
                      <Box
                        key={topic.id}
                        onClick={() => handleSelectTopic(topic)}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          cursor: "pointer",
                          border: 1,
                          borderColor: isSelected ? "primary.main" : "divider",
                          bgcolor: isSelected ? "action.selected" : "transparent",
                          transition: "all 0.2s",
                          "&:hover": { bgcolor: "action.hover", borderColor: "primary.main" },
                        }}
                      >
                        <Typography variant="subtitle2" noWrap>
                          {i + 1}. {topic.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {topic.content?.substring(0, 40)}…
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Paper>
          </Grid>

          {/* ── Main content area ───────────────────────────────────────────── */}
          <Grid
            item
            xs={12}
            md={9}
            sx={{ flex: 1 }}
            container
            direction="column"
            spacing={3}>
            {selectedTopic ? (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 3,
                  minHeight: "50vh",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6" fontWeight={700}>
                    {selectedTopic.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {selectedTopic.content && (
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        startIcon={<AutoAwesomeIcon />}
                        onClick={() => navigate("/dashboard/platform/quiz", {
                          state: {
                            topic: selectedTopic.title,
                            subject: lesson?.subject?.name,
                            grade: lesson?.grade?.name,
                            lesson_id: lesson?.id
                          }
                        })}
                      >
                        Quiz Me
                      </Button>
                    )}
                    {selectedTopic.content && (
                      <ToggleButtonGroup
                        value={contentFormat}
                        exclusive
                        onChange={handleFormatChange}
                        size="small"
                        aria-label="text format"
                        sx={{ mr: 2 }}
                      >
                        <ToggleButton value="text" aria-label="standard text">
                          Text
                        </ToggleButton>
                        <ToggleButton value="mindmap" aria-label="mind map">
                          Mind Map
                        </ToggleButton>
                        <ToggleButton value="audio" aria-label="audio script">
                          Audio
                        </ToggleButton>
                      </ToggleButtonGroup>
                    )}
                    <Chip
                      size="small"
                      label={selectedTopic.content ? "Has content" : "No content"}
                      color={selectedTopic.content ? "success" : "default"}
                      variant="outlined"
                    />
                  </Box>
                </Box>
                <Divider sx={{ mb: 2.5 }} />

                {selectedTopic.content ? (
                  <>
                    {isAdapting && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <CircularProgress />
                      </Box>
                    )}

                    {!isAdapting && contentFormat === "mindmap" && (
                      <Box sx={{ width: '100%', overflowX: 'auto', p: 2, bgcolor: "background.paper", borderRadius: 2 }}>
                        <div ref={mermaidRef} />
                      </Box>
                    )}

                    {!isAdapting && contentFormat === "audio" && (
                      <Box sx={{ mt: 2, mb: 4, p: 3, border: 1, borderColor: "divider", borderRadius: 2, bgcolor: "background.default" }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Listen to this topic</Typography>
                        {topicCodeCache[selectedTopic.id]?.audioUrl ? (
                          <Box sx={{ width: '100%', textAlign: 'center' }}>
                            <audio controls style={{ width: '100%' }}>
                              {/* Since it's local FastAPI, proxy it similar to images */}
                              <source src={`http://localhost:8001${topicCodeCache[selectedTopic.id].audioUrl}`} type="audio/wav" />
                              Your browser does not support the audio element.
                            </audio>
                            <Typography variant="caption" sx={{ mt: 2, display: 'block', color: "text.secondary" }}>
                              Auto-generated audio summary script for this topic.
                            </Typography>
                          </Box>
                        ) : (
                          <Typography>Audio could not be loaded.</Typography>
                        )}
                      </Box>
                    )}

                    {!isAdapting && contentFormat === "text" && (
                      <Box
                        sx={{
                          whiteSpace: "pre-wrap",
                          lineHeight: 1.85,
                          color: "text.primary",
                          "& img": { maxWidth: "100%", height: "auto", borderRadius: 2, my: 2 },
                          "& iframe": { width: "100%", aspectRatio: "16/9", borderRadius: 2, my: 2, border: "none" },
                          "& blockquote": { borderLeft: "4px solid", borderColor: "primary.main", pl: 2, my: 2, fontStyle: "italic", bgcolor: "action.hover", py: 1, pr: 1, borderRadius: "0 8px 8px 0" },
                          "& pre": { bgcolor: "grey.900", color: "grey.100", p: 2, borderRadius: 2, overflowX: "auto", my: 2 },
                          "& code": { fontFamily: "monospace", bgcolor: "action.hover", px: 0.5, py: 0.25, borderRadius: 1 },
                          "& h1, & h2, & h3, & h4": { fontWeight: 700, mt: 3, mb: 1.5 },
                          "& a": { color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" } }
                        }}
                        dangerouslySetInnerHTML={{ __html: selectedTopic.content }}
                      />
                    )}
                  </>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      py: 6,
                      gap: 2,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      No content yet for this topic.
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={handleGenerateAndSaveContent}
                      disabled={isGeneratingTopicContent}
                    >
                      {isGeneratingTopicContent
                        ? <CircularProgress size={20} color="inherit" />
                        : "✨ Generate Content"}
                    </Button>
                    <Typography variant="caption" color="text.disabled">
                      Or click the Edit button below to write it manually.
                    </Typography>
                  </Box>
                )}
              </Paper>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 3,
                  textAlign: "center",
                  minHeight: "40vh",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography color="text.secondary">
                  Select a topic from the left sidebar to view its content.
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Box>

      {/* ── Bottom Navigation ────────────────────────────────────────────────── */}
      <PlatformBottomNav onMenuClick={handleBottomMenu} activePanel={activePanel} />

      {/* ── Snackbar ─────────────────────────────────────────────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PlatformLessonId;
