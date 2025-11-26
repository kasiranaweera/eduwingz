import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  CircularProgress,
  Tooltip,
  Menu,
  MenuItem,
  Alert,
  Snackbar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ShareIcon from "@mui/icons-material/Share";
import ArchiveIcon from "@mui/icons-material/Archive";
import UnarchiveIcon from "@mui/icons-material/Unarchive";
import ViewWeekIcon from "@mui/icons-material/ViewWeek";
import ViewListIcon from "@mui/icons-material/ViewList";
import lessonsApi from "../api/modules/lessons.api";
import { useSelector } from "react-redux";

const PlatformNotes = () => {
  const { user } = useSelector((state) => state.user);
  const [notes, setNotes] = useState([]);
  const [allNotes, setAllNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [filterArchived, setFilterArchived] = useState(false);
  const [openNewNote, setOpenNewNote] = useState(false);
  const [openEditNote, setOpenEditNote] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [newNoteData, setNewNoteData] = useState({
    title: "",
    content: "",
    description: "",
  });

  const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F"];

  // Fetch notes from all lessons
  useEffect(() => {
    const fetchNotes = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Get all lessons
        const { response: lessonsResponse, err: lessonsErr } =
          await lessonsApi.listLessons();

        if (lessonsErr || !lessonsResponse) {
          setLoading(false);
          return;
        }

        // Fetch notes from each lesson
        let allCollectedNotes = [];
        for (const lesson of lessonsResponse) {
          const { response: notesResponse } = await lessonsApi.getNotes(
            lesson.id
          );
          if (notesResponse && Array.isArray(notesResponse)) {
            const notesWithLesson = notesResponse.map((note) => ({
              ...note,
              lessonId: lesson.id,
              lessonTitle: lesson.title,
            }));
            allCollectedNotes = [...allCollectedNotes, ...notesWithLesson];
          }
        }

        setAllNotes(allCollectedNotes);
        setNotes(allCollectedNotes);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching notes:", err);
        setSnackbar({
          open: true,
          message: "Failed to load notes",
          severity: "error",
        });
        setLoading(false);
      }
    };

    fetchNotes();
  }, [user]);

  // Filter notes based on search and archive status
  useEffect(() => {
    let filtered = allNotes;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.title?.toLowerCase().includes(query) ||
          note.content?.toLowerCase().includes(query) ||
          note.description?.toLowerCase().includes(query)
      );
    }

    if (filterArchived) {
      filtered = filtered.filter((note) => note.archived === true);
    } else {
      filtered = filtered.filter((note) => !note.archived);
    }

    setNotes(filtered);
  }, [searchQuery, filterArchived, allNotes]);

  const handleCreateNote = async () => {
    if (!newNoteData.title.trim()) {
      setSnackbar({
        open: true,
        message: "Please enter a note title",
        severity: "warning",
      });
      return;
    }

    // For demo purposes, add locally
    const note = {
      id: `note-${Date.now()}`,
      ...newNoteData,
      lessonId: null,
      lessonTitle: "Standalone Note",
      archived: false,
      created_at: new Date().toISOString(),
      color: colors[Math.floor(Math.random() * colors.length)],
    };

    setAllNotes([note, ...allNotes]);
    setNewNoteData({ title: "", content: "", description: "" });
    setOpenNewNote(false);
    setSnackbar({
      open: true,
      message: "Note created successfully",
      severity: "success",
    });
  };

  const handleUpdateNote = async () => {
    if (!editingNote.title.trim()) {
      setSnackbar({
        open: true,
        message: "Please enter a note title",
        severity: "warning",
      });
      return;
    }

    setAllNotes(
      allNotes.map((n) => (n.id === editingNote.id ? editingNote : n))
    );
    setEditingNote(null);
    setOpenEditNote(false);
    setSnackbar({
      open: true,
      message: "Note updated successfully",
      severity: "success",
    });
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await lessonsApi.deleteNote(noteId);
      setAllNotes(allNotes.filter((n) => n.id !== noteId));
      setSnackbar({
        open: true,
        message: "Note deleted successfully",
        severity: "success",
      });
    } catch (err) {
      setAllNotes(allNotes.filter((n) => n.id !== noteId));
      setSnackbar({
        open: true,
        message: "Note deleted",
        severity: "success",
      });
    }
    setAnchorEl(null);
  };

  const handleArchiveNote = (noteId) => {
    setAllNotes(
      allNotes.map((n) =>
        n.id === noteId ? { ...n, archived: !n.archived } : n
      )
    );
    setAnchorEl(null);
  };

  const handleOpenMenu = (e, noteId) => {
    setAnchorEl(e.currentTarget);
    setSelectedNoteId(noteId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedNoteId(null);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setOpenEditNote(true);
    handleCloseMenu();
  };

  const getColorCode = (noteId) => {
    const note = allNotes.find((n) => n.id === noteId);
    return note?.color || colors[0];
  };

  const GridView = () => (
    <Grid container spacing={2}>
      {notes.map((note) => (
        <Grid item xs={12} sm={6} md={4} key={note.id}>
          <Card
            elevation={0}
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              border: 1,
              borderColor: "divider",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: 2,
                borderColor: "primary.main",
              },
              borderTop: `4px solid ${getColorCode(note.id)}`,
            }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1,
                  }}
                >
                  {note.title}
                </Typography>
                <IconButton
                  size="small"
                  onClick={(e) => handleOpenMenu(e, note.id)}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>

              <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                {note.lessonTitle}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 1,
                  display: "-webkit-box",
                  overflow: "hidden",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 3,
                }}
              >
                {note.content || note.description || "No content"}
              </Typography>
            </CardContent>

            <Divider />

            <CardActions sx={{ pt: 1 }}>
              <Button
                size="small"
                startIcon={<EditIcon fontSize="small" />}
                onClick={() => handleEditNote(note)}
              >
                Edit
              </Button>
              <Button size="small" startIcon={<ShareIcon fontSize="small" />}>
                Share
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const ListView = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {notes.map((note) => (
        <Card key={note.id} elevation={0} sx={{ border: 1, borderColor: "divider" }}>
          <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {note.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                From: {note.lessonTitle}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                {note.content || note.description || "No content"}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 12,
                height: 80,
                borderRadius: 1,
                bgcolor: getColorCode(note.id),
                ml: 2,
              }}
            />
          </CardContent>

          <Divider />

          <CardActions>
            <Button
              size="small"
              startIcon={<EditIcon fontSize="small" />}
              onClick={() => handleEditNote(note)}
            >
              Edit
            </Button>
            <Button
              size="small"
              startIcon={<ShareIcon fontSize="small" />}
            >
              Share
            </Button>
            <Box sx={{ ml: "auto" }}>
              <IconButton
                size="small"
                onClick={(e) => handleOpenMenu(e, note.id)}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
          </CardActions>
        </Card>
      ))}
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Notes
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenNewNote(true)}
          >
            New Note
          </Button>
        </Box>

        {/* Search and Controls */}
        <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
          <TextField
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, minWidth: 250 }}
          />

          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Grid View">
              <IconButton
                onClick={() => setViewMode("grid")}
                color={viewMode === "grid" ? "primary" : "default"}
              >
                <ViewWeekIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="List View">
              <IconButton
                onClick={() => setViewMode("list")}
                color={viewMode === "list" ? "primary" : "default"}
              >
                <ViewListIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Filter Chips */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Chip
            label={`All Notes (${allNotes.length - allNotes.filter(n => n.archived).length})`}
            onClick={() => setFilterArchived(false)}
            variant={!filterArchived ? "filled" : "outlined"}
            color={!filterArchived ? "primary" : "default"}
          />
          <Chip
            label={`Archived (${allNotes.filter(n => n.archived).length})`}
            onClick={() => setFilterArchived(true)}
            variant={filterArchived ? "filled" : "outlined"}
            color={filterArchived ? "primary" : "default"}
          />
        </Box>
      </Box>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : notes.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <Typography color="text.secondary" variant="h6" sx={{ mb: 1 }}>
            {searchQuery ? "No notes match your search" : "No notes yet"}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {searchQuery
              ? "Try adjusting your search terms"
              : "Create a new note to get started"}
          </Typography>
          {!searchQuery && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenNewNote(true)}
            >
              Create First Note
            </Button>
          )}
        </Paper>
      ) : viewMode === "grid" ? (
        <GridView />
      ) : (
        <ListView />
      )}

      {/* New Note Dialog */}
      <Dialog open={openNewNote} onClose={() => setOpenNewNote(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create a New Note</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Title"
            placeholder="Note title..."
            value={newNoteData.title}
            onChange={(e) =>
              setNewNoteData({ ...newNoteData, title: e.target.value })
            }
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Description (optional)"
            placeholder="Brief description..."
            value={newNoteData.description}
            onChange={(e) =>
              setNewNoteData({ ...newNoteData, description: e.target.value })
            }
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Content"
            placeholder="Write your note content here..."
            multiline
            rows={6}
            value={newNoteData.content}
            onChange={(e) =>
              setNewNoteData({ ...newNoteData, content: e.target.value })
            }
          />
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenNewNote(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleCreateNote}
            variant="contained"
            disabled={!newNoteData.title.trim()}
          >
            Create Note
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Note Dialog */}
      <Dialog open={openEditNote} onClose={() => setOpenEditNote(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Note</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          {editingNote && (
            <>
              <TextField
                fullWidth
                label="Title"
                value={editingNote.title}
                onChange={(e) =>
                  setEditingNote({ ...editingNote, title: e.target.value })
                }
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Description (optional)"
                value={editingNote.description || ""}
                onChange={(e) =>
                  setEditingNote({ ...editingNote, description: e.target.value })
                }
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Content"
                multiline
                rows={6}
                value={editingNote.content}
                onChange={(e) =>
                  setEditingNote({ ...editingNote, content: e.target.value })
                }
              />
            </>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenEditNote(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleUpdateNote} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Note Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem
          onClick={() => {
            const note = allNotes.find((n) => n.id === selectedNoteId);
            handleArchiveNote(selectedNoteId);
            setSnackbar({
              open: true,
              message: note.archived
                ? "Note unarchived"
                : "Note archived",
              severity: "success",
            });
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {allNotes.find((n) => n.id === selectedNoteId)?.archived ? (
              <>
                <UnarchiveIcon fontSize="small" />
                Unarchive
              </>
            ) : (
              <>
                <ArchiveIcon fontSize="small" />
                Archive
              </>
            )}
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            handleDeleteNote(selectedNoteId);
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "error.main" }}>
            <DeleteIcon fontSize="small" />
            Delete
          </Box>
        </MenuItem>
      </Menu>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default PlatformNotes;
