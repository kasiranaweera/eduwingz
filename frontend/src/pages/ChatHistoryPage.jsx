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
  useTheme,
  IconButton,
} from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import chatApi from "../api/modules/chat.api";
import { useSelector } from "react-redux";

import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import CopyAllOutlinedIcon from "@mui/icons-material/CopyAllOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";

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
  const { themeMode } = useSelector((state) => state.themeMode);
  const [sessions, setSessions] = useState([]);

  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        const { response, err } = await chatApi.listSessions();
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
        toast.error("Failed to delete session:")
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
    navigate(`/dashboard/chat/${sessionId}`)
  };

  return (
    <Box sx={{}}>
      <Typography variant="h5" gutterBottom>
        Chat history
      </Typography>

      <Box
        sx={{
          mt: 1,
          bgcolor: "background.paper",
          borderRadius: 1,
          boxShadow: 1,
          overflow: "hidden",
        }}
      >
        <List disablePadding>
          {sessions.length === 0 ? (
            <Box sx={{ p: 3 }}>
              <Typography color="text.secondary">No chats yet.</Typography>
            </Box>
          ) : (
            sessions.map((s, idx) => (
              <React.Fragment key={s.id || idx}>
                <ListItemButton alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      <ChatBubbleOutlineIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={s.title || "Untitled chat"}
                    secondary={
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                      >
                        Last updated:{" "}
                        {formatDateTime(
                          s.lastUpdated || s.updated_at || s.last_modified || ""
                        )}
                      </Typography>
                    }
                  />
                  <Box>
                    <IconButton onClick={() => openChat(s.id)}>
                      <OpenInNewOutlinedIcon />
                    </IconButton>
                    <IconButton>
                      <EditNoteOutlinedIcon />
                    </IconButton>
                    <IconButton>
                      <CopyAllOutlinedIcon />
                    </IconButton>
                    <IconButton onClick={() => deleteSession(s.id)}>
                      <DeleteForeverOutlinedIcon />
                    </IconButton>
                  </Box>
                </ListItemButton>
                {idx < sessions.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))
          )}
        </List>
      </Box>
    </Box>
  );
};

export default ChatHistoryPage;
