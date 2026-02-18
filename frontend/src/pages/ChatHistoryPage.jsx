import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import chatApi from "../api/modules/chat.api";
import { useSelector } from "react-redux";

import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import CopyAllOutlinedIcon from "@mui/icons-material/CopyAllOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

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

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);

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
        setSessions(response);

        // if (!err && response && response.data && Array.isArray(response.data)) {
        //   if (mounted) {
        //     setSessions(response);
        //   }
        // }
      } catch (e) {
        console.error("Failed to load sessions:", e);
      }
    };

    load();

    // return () => {
    //   mounted = false;
    // };
  }, []);

  const deleteSession = async (sessionId) => {
    console.log("delete", sessionId);
    try {
      // privateClient interceptor returns `response.data` (not full axios response)
      // chatApi.deleteSession returns { response } or { err }
      const { response, err } = await chatApi.deleteSession(sessionId);

      if (err) {
        console.error("Failed to delete session:", err);
        toast.error("Failed to delete session:");
        return;
      }

      // Treat a non-error response as success. Optimistically remove the session.
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      console.log("Session deleted successfully", response);
      toast.success("Session deleted successfully");
    } catch (e) {
      console.error("Error deleting session:", e);
    }
  };

  const openChat = (sessionId) => {
    navigate(`/dashboard/chat/${sessionId}`);
  };

  return (
    <>
      <Box sx={{}}>
        <Typography variant="h5" gutterBottom>
          Chat history
        </Typography>

        <Box
          sx={{
            mt: 1,
            boxShadow: 1,
            overflow: "hidden",
          }}
        >
          <List sx={{  }} disablePadding>
            {sessions.length === 0 ? (
              <Box sx={{ p: 3 }}>
                <Typography color="text.secondary">No chats yet.</Typography>
              </Box>
            ) : (
              sessions.reverse().map((s, idx) => (
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
                    <Box>
                      <Tooltip title="Share Chat" arrow>
                        <IconButton>
                          <ShareOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Rename Chat" arrow>
                        <IconButton>
                          <EditNoteOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Copy Chat Log" arrow>
                        <IconButton>
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
                  {idx < sessions.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))
            )}
          </List>
        </Box>
      </Box>
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
              sx={{}}
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
    </>
  );
};

export default ChatHistoryPage;
