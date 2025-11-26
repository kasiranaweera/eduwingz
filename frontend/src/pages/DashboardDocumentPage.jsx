import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
  Alert,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Add as AddIcon,
  FilterList as FilterListIcon,
  SwapVert as SortIcon,
  MoreVert as MoreVertIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  VideoLibrary as VideoIcon,
  TextFields as TextIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
} from "@mui/icons-material";
import documentApi from "../api/modules/document.api";
import DocumentPreviewModal from "../components/DocumentPreviewModal";
import uiConfigs from "../configs/ui.config";

// Sample documents data for fallback
const sampleDocuments = [
  {
    id: "1",
    title: "Test Cases",
    description: "Comprehensive test cases document",
    file_type: "PDF",
    doc_type: "Uploads",
    category: "Uploads",
    created_at: "2025-11-20T10:00:00Z",
    file_size: 1024000,
  },
  {
    id: "2",
    title: "SOA NOTE",
    description: "Service Oriented Architecture notes",
    file_type: "PDF",
    doc_type: "Notes",
    category: "Notes",
    created_at: "2025-11-19T15:30:00Z",
    file_size: 2048000,
  },
  {
    id: "3",
    title: "Complete Machine Learning Study Guide",
    description: "Comprehensive guide for machine learning concepts",
    file_type: "PDF",
    doc_type: "Uploads",
    category: "Uploads",
    created_at: "2025-11-21T08:45:00Z",
    file_size: 3072000,
  },
  {
    id: "4",
    title: "Grade 10 Science Text Book",
    description: "Complete science textbook for grade 10",
    file_type: "PDF",
    doc_type: "Uploads",
    category: "Uploads",
    created_at: "2025-11-18T12:15:00Z",
    file_size: 4096000,
  },
];

const CATEGORIES = ["All", "Uploads", "Notes", "Generated Items"];
const DOC_TYPES = [
  "All",
  "PDF",
  "Image",
  "Text",
  "Video",
  "Audio",
  "Document",
];
const SORT_OPTIONS = ["Newest First", "Oldest First", "Name (A-Z)", "Name (Z-A)", "Size (Largest)"];

const getFileIcon = (fileType) => {
  if (!fileType) return <DescriptionIcon />;
  const type = fileType.toLowerCase();
  if (type.includes("pdf")) return <PdfIcon />;
  if (type.includes("image")) return <ImageIcon />;
  if (type.includes("video")) return <VideoIcon />;
  if (type.includes("text") || type.includes("txt")) return <TextIcon />;
  return <DescriptionIcon />;
};

const DashboardDocumentPage = () => {
  // Redux
  const { user } = useSelector((state) => state.user);
  const userId = user?.id;

  // State management
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [sortOrder, setSortOrder] = useState("Newest First");
  const [isAscending, setIsAscending] = useState(false);

  // UI State
  const [categoryAnchorEl, setCategoryAnchorEl] = useState(null);
  const [typeAnchorEl, setTypeAnchorEl] = useState(null);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [docAnchorEl, setDocAnchorEl] = useState(null);
  const [selectedDocId, setSelectedDocId] = useState(null);

  // Modal states
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    applyFiltersAndSort();
  }, [documents, searchQuery, selectedCategory, selectedType, sortOrder, isAscending]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);

      console.log("Fetching documents for authenticated user");
      const { response, err } = await documentApi.getDocuments({
        search: "",
      });

      if (err) {
        console.error("API Error:", err);
        console.log("Using sample documents as fallback");
        setSnackbar({
          open: true,
          message: "Using sample documents - could not fetch live documents",
          severity: "warning",
        });
        setDocuments(sampleDocuments);
      } else {
        console.log("Documents loaded:", response);
        // Set actual response from API, fallback to sample if empty
        if (!response || response.length === 0) {
          console.log("API returned empty, using sample documents");
          setDocuments(sampleDocuments);
        } else {
          setDocuments(response);
        }
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      console.log("Using sample documents as fallback");
      setDocuments(sampleDocuments);
    } finally {
      setLoading(false);
    }
  };

  const generateMockDocuments = () => {
    // Mock data disabled - remove this function or use for testing
    return [];
  };

  const applyFiltersAndSort = () => {
    let filtered = [...documents];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.title?.toLowerCase().includes(query) ||
          doc.description?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((doc) => doc.category === selectedCategory);
    }

    // Filter by type
    if (selectedType !== "All") {
      filtered = filtered.filter((doc) => doc.file_type === selectedType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      if (sortOrder === "Newest First") {
        comparison = new Date(b.created_at) - new Date(a.created_at);
      } else if (sortOrder === "Oldest First") {
        comparison = new Date(a.created_at) - new Date(b.created_at);
      } else if (sortOrder === "Name (A-Z)") {
        comparison = a.title.localeCompare(b.title);
      } else if (sortOrder === "Name (Z-A)") {
        comparison = b.title.localeCompare(a.title);
      } else if (sortOrder === "Size (Largest)") {
        comparison = (b.file_size || 0) - (a.file_size || 0);
      }

      return isAscending ? -comparison : comparison;
    });

    setFilteredDocuments(filtered);
  };

  const handleToggleSort = () => {
    setIsAscending(!isAscending);
  };

  const handleDocumentClick = (doc) => {
    setSelectedDocument(doc);
    setPreviewOpen(true);
  };

  const handleDeleteDocument = async (docId) => {
    try {
      const { err } = await documentApi.deleteDocument(docId);

      if (err) {
        setSnackbar({
          open: true,
          message: "Failed to delete document",
          severity: "error",
        });
        return;
      }

      setDocuments(documents.filter((d) => d.id !== docId));
      setSnackbar({
        open: true,
        message: "Document deleted successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      setSnackbar({
        open: true,
        message: "Error deleting document",
        severity: "error",
      });
    }
  };

  const handleDownloadDocument = (doc) => {
    // Implement download logic
    setSnackbar({
      open: true,
      message: `Downloading: ${doc.title}`,
      severity: "info",
    });
  };

  const handleShareDocument = (doc) => {
    // Implement share logic
    setSnackbar({
      open: true,
      message: `Share feature for: ${doc.title}`,
      severity: "info",
    });
  };

  const handleUploadDocument = async () => {
    if (!uploadFile) {
      setSnackbar({
        open: true,
        message: "Please select a file",
        severity: "warning",
      });
      return;
    }

    try {
      // Note: For upload, you'll need a sessionId. If there's a current session, pass it here.
      // For now, we'll create a temporary session or use a default one.
      const sessionId = ""; // Add logic to get current session ID if needed

      const { response, err } = await documentApi.uploadDocument(sessionId, uploadFile, {
        title: uploadTitle || uploadFile.name,
      });

      if (err) {
        setSnackbar({
          open: true,
          message: "Failed to upload document",
          severity: "error",
        });
        return;
      }

      setDocuments([response, ...documents]);
      setUploadDialogOpen(false);
      setUploadFile(null);
      setUploadTitle("");
      setSnackbar({
        open: true,
        message: "Document uploaded successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error uploading document:", error);
      setSnackbar({
        open: true,
        message: "Error uploading document",
        severity: "error",
      });
    }
  };

  const hasActiveFilters = selectedCategory !== "All" || selectedType !== "All" || searchQuery.trim() !== "";

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", pb: 4 }}>
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        {/* Left: Title */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{  }}>
              Documents
            </Typography>
          </Box>
        </Box>

        {/* Right: Control Buttons */}
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {/* Category Button */}
          <Tooltip title="Select Category">
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={(e) => setCategoryAnchorEl(e.currentTarget)}
              sx={{
                borderRadius: 3,
                textTransform: "none",
                border: 1,
                borderColor: "graycolor.two",
                color: selectedCategory !== "All" ? "primary.main" : "inherit",
              }}
            >
              Category
            </Button>
          </Tooltip>
          <Menu
            anchorEl={categoryAnchorEl}
            open={Boolean(categoryAnchorEl)}
            onClose={() => setCategoryAnchorEl(null)}
            PaperProps={{
              sx: {
                borderRadius: 2,
                border: 1,
                borderColor: "graycolor.two",
              },
            }}
          >
            {CATEGORIES.map((cat) => (
              <MenuItem
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCategoryAnchorEl(null);
                }}
                selected={selectedCategory === cat}
              >
                {cat}
              </MenuItem>
            ))}
          </Menu>

          {/* Type Button */}
          <Tooltip title="Select File Type">
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={(e) => setTypeAnchorEl(e.currentTarget)}
              sx={{
                borderRadius: 3,
                textTransform: "none",
                border: 1,
                borderColor: "graycolor.two",
                color: selectedType !== "All" ? "primary.main" : "inherit",
              }}
            >
              Type
            </Button>
          </Tooltip>
          <Menu
            anchorEl={typeAnchorEl}
            open={Boolean(typeAnchorEl)}
            onClose={() => setTypeAnchorEl(null)}
            PaperProps={{
              sx: {
                borderRadius: 2,
                border: 1,
                borderColor: "graycolor.two",
              },
            }}
          >
            {DOC_TYPES.map((type) => (
              <MenuItem
                key={type}
                onClick={() => {
                  setSelectedType(type);
                  setTypeAnchorEl(null);
                }}
                selected={selectedType === type}
              >
                {type}
              </MenuItem>
            ))}
          </Menu>

          {/* Sort Button */}
          <Tooltip title={`Sort: ${isAscending ? "Ascending" : "Descending"}`}>
            <Button
              variant="outlined"
              startIcon={<SortIcon />}
              onClick={(e) => setSortAnchorEl(e.currentTarget)}
              sx={{
                borderRadius: 3,
                textTransform: "none",
                border: 1,
                borderColor: "graycolor.two",
              }}
            >
              {isAscending ? "↑" : "↓"}
            </Button>
          </Tooltip>
          <Menu
            anchorEl={sortAnchorEl}
            open={Boolean(sortAnchorEl)}
            onClose={() => setSortAnchorEl(null)}
            PaperProps={{
              sx: {
                borderRadius: 2,
                border: 1,
                borderColor: "graycolor.two",
              },
            }}
          >
            {SORT_OPTIONS.map((option) => (
              <MenuItem
                key={option}
                onClick={() => {
                  setSortOrder(option);
                  setSortAnchorEl(null);
                }}
                selected={sortOrder === option}
              >
                {option}
              </MenuItem>
            ))}
          </Menu>

          {/* Upload Button */}
          <Tooltip title="Upload Document">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setUploadDialogOpen(true)}
              sx={{
                borderRadius: 3,
                textTransform: "none",
                background: uiConfigs.style.mainGradient.color,
              }}
            >
              Upload
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <Box sx={{ display: "flex", gap: 1, mb: 3, alignItems: "center", flexWrap: "wrap" }}>
          <Typography variant="body2" color="text.secondary">
            Active Filters:
          </Typography>
          {selectedCategory !== "All" && (
            <Chip
              label={selectedCategory}
              onDelete={() => setSelectedCategory("All")}
              size="small"
              variant="outlined"
            />
          )}
          {selectedType !== "All" && (
            <Chip
              label={selectedType}
              onDelete={() => setSelectedType("All")}
              size="small"
              variant="outlined"
            />
          )}
          {searchQuery.trim() && (
            <Chip
              label={`Search: "${searchQuery}"`}
              onDelete={() => setSearchQuery("")}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      )}

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search documents by name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              border: 1,
              borderColor: "graycolor.two",
            },
          }}
        />
      </Box>

      {/* Documents Grid */}
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          <CircularProgress />
        </Box>
      ) : filteredDocuments.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            border: 1,
            borderColor: "graycolor.two",
            borderRadius: 3,
          }}
        >
          <DescriptionIcon sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No documents found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {hasActiveFilters
              ? "Try adjusting your filters"
              : "Upload a new document to get started"}
          </Typography>
          {hasActiveFilters && (
            <Button
              onClick={() => {
                setSelectedCategory("All");
                setSelectedType("All");
                setSearchQuery("");
              }}
              sx={{ mt: 2 }}
            >
              Clear Filters
            </Button>
          )}
          {!hasActiveFilters && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setUploadDialogOpen(true)}
              sx={{
                mt: 2,
                background: uiConfigs.style.mainGradient.color,
                textTransform: "none",
              }}
            >
              Upload Document
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {filteredDocuments.map((doc) => (
            <Grid item xs={12} sm={6} md={4} lg={3} size={2} key={doc.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  border: 1,
                  borderColor: "graycolor.two",
                  borderRadius: 2,
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 3,
                    borderColor: "primary.main",
                  },
                }}
              >
                {/* Document Preview Area */}
                <Box
                  onClick={() => handleDocumentClick(doc)}
                  sx={{
                    p: 2,
                    bgcolor: "grey.100",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "120px",
                    borderBottom: 1,
                    borderColor: "graycolor.two",
                    color: "text.secondary",
                  }}
                >
                  <Box sx={{ fontSize: 40, textAlign: "center" }}>
                    {getFileIcon(doc.file_type)}
                  </Box>
                </Box>

                {/* Document Info */}
                <Box sx={{ p: 2, flex: 1, display: "flex", flexDirection: "column" }}>
                  <Typography
                    variant="subtitle2"
                    noWrap
                    sx={{
                      fontWeight: 600,
                      cursor: "pointer",
                      "&:hover": { color: "primary.main" },
                    }}
                    onClick={() => handleDocumentClick(doc)}
                  >
                    {doc.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      mb: 1,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {doc.description || "No description"}
                  </Typography>

                  {/* Tags */}
                  <Box sx={{ display: "flex", gap: 0.5, mb: 1, flexWrap: "wrap" }}>
                    <Chip label={doc.file_type} size="small" variant="outlined" />
                    <Chip label={doc.doc_type} size="small" />
                  </Box>

                  {/* Date */}
                  <Typography variant="caption" color="text.secondary" sx={{ mt: "auto" }}>
                    {new Date(doc.created_at).toLocaleDateString()}
                  </Typography>
                </Box>

                {/* Action Buttons */}
                <Divider />
                <Box
                  sx={{
                    p: 1,
                    display: "flex",
                    gap: 1,
                    justifyContent: "space-between",
                  }}
                >
                  <Tooltip title="Preview">
                    <IconButton
                      size="small"
                      onClick={() => handleDocumentClick(doc)}
                    >
                      <DescriptionIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download">
                    <IconButton
                      size="small"
                      onClick={() => handleDownloadDocument(doc)}
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Share">
                    <IconButton
                      size="small"
                      onClick={() => handleShareDocument(doc)}
                    >
                      <ShareIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteConfirm(doc.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        open={previewOpen}
        document={selectedDocument}
        onClose={() => {
          setPreviewOpen(false);
          setSelectedDocument(null);
        }}
        onDelete={handleDeleteDocument}
        onDownload={handleDownloadDocument}
        onShare={handleShareDocument}
      />

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => {
          setUploadDialogOpen(false);
          setUploadFile(null);
          setUploadTitle("");
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: 1,
            borderColor: "graycolor.two",
          },
        }}
      >
        <DialogTitle>Upload Document</DialogTitle>
        <Divider />
        <DialogContent sx={{ py: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Document Title"
              placeholder="Enter document title"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              size="small"
            />
            <Box
              sx={{
                p: 2,
                border: "2px dashed",
                borderColor: "primary.main",
                borderRadius: 2,
                textAlign: "center",
                cursor: "pointer",
                bgcolor: "action.hover",
                transition: "all 0.3s",
                "&:hover": {
                  bgcolor: "action.selected",
                },
              }}
              component="label"
            >
              <input
                type="file"
                hidden
                onChange={(e) => setUploadFile(e.target.files[0])}
              />
              <AddIcon sx={{ fontSize: 32, mb: 1, display: "block" }} />
              <Typography variant="body2">
                {uploadFile ? uploadFile.name : "Click to select file or drag and drop"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                PDF, Images, Documents, etc.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              setUploadDialogOpen(false);
              setUploadFile(null);
              setUploadTitle("");
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUploadDocument}
            disabled={!uploadFile}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteConfirm)} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Delete Document?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this document? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              handleDeleteDocument(deleteConfirm);
              setDeleteConfirm(null);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default DashboardDocumentPage;
