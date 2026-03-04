import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
  IconButton,
  Modal,
  Button,
  Tooltip,
  TextField,
  InputAdornment,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SearchIcon from "@mui/icons-material/Search";
import chatApi from "../api/modules/chat.api";

import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import CopyAllOutlinedIcon from "@mui/icons-material/CopyAllOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ITEMS_PER_PAGE = 20;

// Small helper to format date/time
const formatDateTime = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch (e) {
    return iso;
  }
};

const ChatHistoryPage = () => {
  const [sessions, setSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  // Rename dialog state
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameSessionId, setRenameSessionId] = useState(null);
  const [renameTitle, setRenameTitle] = useState("");

  const handleOpenDelete = (id) => {
    setSelectedSessionId(id);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setSelectedSessionId(null);
    setOpenDelete(false);
  };

  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const { response } = await chatApi.listSessions();
        if (response && Array.isArray(response)) {
          setSessions(response);
        } else {
          setSessions([]);
        }
      } catch (e) {
        console.error("Failed to load sessions:", e);
      }
    };

    load();
  }, []);

  // Filtered and sorted sessions (reverse-chronological, filtered by search)
  const filteredSessions = useMemo(() => {
    const sorted = [...sessions].reverse();
    if (!searchQuery.trim()) return sorted;
    const q = searchQuery.toLowerCase();
    return sorted.filter(
      (s) =>
        (s.title || "").toLowerCase().includes(q)
    );
  }, [sessions, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredSessions.length / ITEMS_PER_PAGE));
  const paginatedSessions = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredSessions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSessions, page]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const deleteSession = async (sessionId) => {
    try {
      const { err } = await chatApi.deleteSession(sessionId);

      if (err) {
        console.error("Failed to delete session:", err);
        toast.error("Failed to delete session");
        return;
      }

      setSessions((prev) => (prev ? prev.filter((s) => s.id !== sessionId) : []));
      toast.success("Session deleted successfully");
    } catch (e) {
      console.error("Error deleting session:", e);
    }
  };

  const openChat = (sessionId) => {
    navigate(`/dashboard/chat/${sessionId}`);
  };

  // Rename handlers
  const handleOpenRename = (session) => {
    setRenameSessionId(session.id);
    setRenameTitle(session.title || "");
    setRenameDialogOpen(true);
  };

  const handleCloseRename = () => {
    setRenameDialogOpen(false);
    setRenameSessionId(null);
    setRenameTitle("");
  };

  const handleSubmitRename = async () => {
    if (!renameTitle.trim()) {
      toast.warning("Title cannot be empty");
      return;
    }
    try {
      const { err } = await chatApi.updateSession(renameSessionId, {
        title: renameTitle.trim(),
      });
      if (err) {
        console.error("Failed to rename session:", err);
        toast.error("Failed to rename session");
        return;
      }
      // Update locally
      setSessions((prev) =>
        prev.map((s) =>
          s.id === renameSessionId ? { ...s, title: renameTitle.trim() } : s
        )
      );
      toast.success("Session renamed successfully");
      handleCloseRename();
    } catch (e) {
      console.error("Error renaming session:", e);
      toast.error("Error renaming session");
    }
  };

  const handleCopyChat = async (session) => {
    const text = `Chat: ${session.title || "Untitled"}\nLast updated: ${formatDateTime(
      session.lastUpdated || session.updated_at || session.last_modified || ""
    )}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Chat info copied to clipboard");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShareChat = (session) => {
    const shareText = `Check out my chat: ${session.title || "Untitled"}`;
    if (navigator.share) {
      navigator.share({ title: session.title || "EduWingz Chat", text: shareText });
    } else {
      handleCopyChat(session);
    }
  };

  return (
    <>
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, flexDirection: { xs: "column", sm: "row" }, gap: 1, mb: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
            Chat History
          </Typography>


          {/* Search Bar */}
          <TextField
            placeholder="Search chats by title..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: { xs: "100%", sm: "auto" }, minWidth: { sm: 300 }, maxWidth: { sm: 400 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          /></Box>

        <Box
          sx={{
            mt: 1,
            boxShadow: 1,
            overflow: "hidden",
          }}
        >
          <List disablePadding>
            {paginatedSessions.length === 0 ? (
              <Box sx={{ p: 3 }}>
                <Typography color="text.secondary">
                  {searchQuery.trim()
                    ? "No chats match your search."
                    : "No chats yet."}
                </Typography>
              </Box>
            ) : (
              paginatedSessions.map((s, idx) => (
                <React.Fragment key={s.id || idx}>
                  <ListItemButton
                    sx={{
                      backgroundColor: "background.paper",
                      mb: 1,
                      alignItems: "center",
                    }}
                    alignItems="flex-start"
                  >
                    <ListItemAvatar onClick={() => openChat(s.id)}>
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        <ChatBubbleOutlineIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      onClick={() => openChat(s.id)}
                      primary={s.title || "Untitled chat"}
                      secondary={
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
                          Last updated:{" "}
                          {formatDateTime(
                            s.lastUpdated ||
                            s.updated_at ||
                            s.last_modified ||
                            ""
                          )}
                        </Typography>
                      }
                    />
                    <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <Tooltip title="Share Chat" arrow>
                        <IconButton onClick={() => handleShareChat(s)}>
                          <ShareOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Rename Chat" arrow>
                        <IconButton onClick={() => handleOpenRename(s)}>
                          <EditNoteOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Copy Chat Log" arrow>
                        <IconButton onClick={() => handleCopyChat(s)}>
                          <CopyAllOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Chat" arrow>
                        <IconButton onClick={() => handleOpenDelete(s.id)}>
                          <DeleteForeverOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItemButton>
                  {idx < paginatedSessions.length - 1 && (
                    <Divider component="li" />
                  )}
                </React.Fragment>
              ))
            )}
          </List>
        </Box>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Box>

      {/* Delete Confirmation Modal */}
      <Modal
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
        open={openDelete}
        onClose={handleCloseDelete}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            backgroundColor: "background.paper",
            width: "auto",
            height: "auto",
            borderRadius: 3,
            justifyContent: "center",
            alignItems: "center",
            p: 3,
          }}
        >
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Delete Chat?
          </Typography>
          <Typography
            id="modal-modal-description"
            sx={{ mt: 1, fontWeight: 400 }}
          >
            This will permanently remove your chat history. <br />
            Are you sure you want to continue?
          </Typography>
          <Box
            sx={{
              display: "flex",
              mt: 3,
              gap: 1,
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="outlined"
              sx={{ color: "inherit", borderColor: "inherit" }}
              size="small"
              onClick={handleCloseDelete}
            >
              Cancel
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={() => {
                deleteSession(selectedSessionId);
                handleCloseDelete();
              }}
              color="error"
            >
              Yes, delete
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Rename Dialog */}
      <Dialog
        open={renameDialogOpen}
        onClose={handleCloseRename}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Rename Chat</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Chat Title"
            fullWidth
            value={renameTitle}
            onChange={(e) => setRenameTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmitRename();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRename}>Cancel</Button>
          <Button onClick={handleSubmitRename} variant="contained">
            Rename
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ChatHistoryPage;
