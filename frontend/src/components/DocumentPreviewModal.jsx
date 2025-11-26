import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Divider,
  Chip,
  Stack,
} from "@mui/material";
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  VideoLibrary as VideoIcon,
  TextFields as TextIcon,
} from "@mui/icons-material";

const getFileIcon = (fileType) => {
  if (!fileType) return <DescriptionIcon sx={{ fontSize: 80 }} />;
  const type = fileType.toLowerCase();
  if (type.includes("pdf")) return <PdfIcon sx={{ fontSize: 80 }} />;
  if (type.includes("image")) return <ImageIcon sx={{ fontSize: 80 }} />;
  if (type.includes("video")) return <VideoIcon sx={{ fontSize: 80 }} />;
  if (type.includes("text") || type.includes("txt")) return <TextIcon sx={{ fontSize: 80 }} />;
  return <DescriptionIcon sx={{ fontSize: 80 }} />;
};

const formatFileSize = (bytes) => {
  if (!bytes) return "Unknown";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

const DocumentPreviewModal = ({
  open,
  document,
  onClose,
  onDelete,
  onDownload,
  onShare,
}) => {
  if (!document) return null;

  const handleDelete = () => {
    if (onDelete) {
      onDelete(document.id);
    }
    onClose();
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(document);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(document);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
      {/* Header with close button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Document Preview
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      {/* Content */}
      <DialogContent sx={{ py: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* File Icon / Preview */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              p: 2,
              bgcolor: "grey.100",
              borderRadius: 2,
              minHeight: "150px",
              color: "text.secondary",
            }}
          >
            {getFileIcon(document.file_type)}
          </Box>

          {/* Document Info */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Title */}
            <Box>
              <Typography variant="caption" color="text.secondary">
                Title
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 0.5 }}>
                {document.title}
              </Typography>
            </Box>

            {/* Description */}
            {document.description && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {document.description}
                </Typography>
              </Box>
            )}

            {/* Metadata */}
            <Stack spacing={1}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="caption" color="text.secondary">
                  File Type:
                </Typography>
                <Typography variant="body2">{document.file_type}</Typography>
              </Box>

              {document.file_size && (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="caption" color="text.secondary">
                    Size:
                  </Typography>
                  <Typography variant="body2">
                    {formatFileSize(document.file_size)}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="caption" color="text.secondary">
                  Created:
                </Typography>
                <Typography variant="body2">
                  {new Date(document.created_at).toLocaleDateString()}
                </Typography>
              </Box>

              {document.updated_at && (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="caption" color="text.secondary">
                    Last Updated:
                  </Typography>
                  <Typography variant="body2">
                    {new Date(document.updated_at).toLocaleDateString()}
                  </Typography>
                </Box>
              )}
            </Stack>

            {/* Tags */}
            {(document.category || document.doc_type) && (
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {document.category && (
                  <Chip label={document.category} size="small" variant="outlined" />
                )}
                {document.doc_type && (
                  <Chip label={document.doc_type} size="small" />
                )}
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <Divider />

      {/* Actions */}
      <DialogActions
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        {/* Left side actions */}
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="Download">
            <IconButton onClick={handleDownload} color="primary">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Share">
            <IconButton onClick={handleShare} color="primary">
              <ShareIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={handleDelete} color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Right side button */}
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentPreviewModal;
