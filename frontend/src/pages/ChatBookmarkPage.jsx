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
import BookmarkIcon from "@mui/icons-material/Bookmark";
import chatApi from "../api/modules/chat.api";

import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import CopyAllOutlinedIcon from "@mui/icons-material/CopyAllOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

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

const ChatBookmarkPage = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedBookmarkId, setSelectedBookmarkId] = useState(null);

  const handleOpenDelete = (id) => {
    setSelectedBookmarkId(id);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setSelectedBookmarkId(null);
    setOpenDelete(false);
  };

  const navigate = useNavigate();

  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        setLoading(true);
        const { response, err } = await chatApi.listBookmarks();
        
        if (!err && response) {
          setBookmarks(response);
        } else {
          console.error("Failed to load bookmarks:", err);
          toast.error("Failed to load bookmarks");
        }
      } catch (e) {
        console.error("Error loading bookmarks:", e);
        toast.error("Error loading bookmarks");
      } finally {
        setLoading(false);
      }
    };

    loadBookmarks();
  }, []);

  const deleteBookmark = async (bookmarkId) => {
    try {
      const { response, err } = await chatApi.deleteBookmark(bookmarkId);

      if (err) {
        console.error("Failed to delete bookmark:", err);
        toast.error("Failed to delete bookmark");
        return;
      }

      setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
      console.log("Bookmark deleted successfully", response);
      toast.success("Bookmark deleted successfully");
    } catch (e) {
      console.error("Error deleting bookmark:", e);
      toast.error("Error deleting bookmark");
    }
  };

  const handleCopyContent = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Content copied to clipboard");
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy content");
    }
  };

  const handleOpenChat = (sessionId, messageId) => {
    navigate(`/dashboard/chat/${sessionId}`, { state: { messageId } });
  };

  const handleShareBookmark = (bookmark) => {
    const shareText = `Check out this bookmarked response:\n\n${bookmark.title}\n\n${bookmark.content}`;
    if (navigator.share) {
      navigator.share({
        title: bookmark.title,
        text: shareText,
      });
    } else {
      handleCopyContent(shareText);
    }
  };

  return (
    <>
      <Box sx={{}}>
        <Typography variant="h5" gutterBottom>
          Bookmarks
        </Typography>

        <Box
          sx={{
            mt: 1,
            boxShadow: 1,
            overflow: "hidden",
          }}
        >
          <List sx={{ }} disablePadding>
            {loading ? (
              <Box sx={{ p: 3 }}>
                <Typography color="text.secondary">Loading bookmarks...</Typography>
              </Box>
            ) : bookmarks.length === 0 ? (
              <Box sx={{ p: 3 }}>
                <Typography color="text.secondary">
                  No bookmarks yet. Bookmark important responses from your chats!
                </Typography>
              </Box>
            ) : (
              bookmarks.map((bookmark, idx) => (
                <React.Fragment key={bookmark.id || idx}>
                  <ListItemButton
                    sx={{
                      backgroundColor: "background.paper",
                      mb: 1,
                      alignItems: "center",

                    }}
                    alignItems="flex-start"
                  >
                    <ListItemAvatar
                      onClick={() =>
                        handleOpenChat(bookmark.session_id, bookmark.message_id)
                      }
                      sx={{ cursor: "pointer" }}
                    >
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        <BookmarkIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      onClick={() =>
                        handleOpenChat(bookmark.session_id, bookmark.message_id)
                      }
                      sx={{ cursor: "pointer" }}
                      primary={bookmark.title || "Untitled bookmark"}
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                            display="block"
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {bookmark.message_content}
                          </Typography>
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            sx={{mt:2}}
                          >
                            From: {bookmark.session_title} • Bookmarked:{" "}
                            {formatDateTime(bookmark.created_at)}
                          </Typography>
                        </Box>
                      }
                    />
                    <Box>
                      <Tooltip title="Open in Chat" arrow>
                        <IconButton
                          onClick={() =>
                            handleOpenChat(bookmark.session_id, bookmark.message_id)
                          }
                        >
                          <OpenInNewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Share Bookmark" arrow>
                        <IconButton
                          onClick={() => handleShareBookmark(bookmark)}
                        >
                          <ShareOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Copy Content" arrow>
                        <IconButton
                          onClick={() => handleCopyContent(bookmark.content)}
                        >
                          <CopyAllOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Bookmark" arrow>
                        <IconButton onClick={() => handleOpenDelete(bookmark.id)}>
                          <DeleteForeverOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItemButton>
                  {idx < bookmarks.length - 1 && <Divider component="li" />}
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
            Delete Bookmark?
          </Typography>
          <Typography
            id="modal-modal-description"
            sx={{ mt: 1, fontWeight: 400 }}
          >
            This will permanently remove your bookmark. <br />
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
                deleteBookmark(selectedBookmarkId);
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

export default ChatBookmarkPage;
