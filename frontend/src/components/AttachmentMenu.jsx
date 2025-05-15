import { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Typography
} from '@mui/material';
import {
  Add,
  CloudUpload,
  InsertDriveFile
} from '@mui/icons-material';

const AttachmentMenu = ({ onFileSelect }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleFileUpload = (source) => {
    // Handle different upload sources
    if (source === 'device') {
      const input = document.createElement('input');
      input.type = 'file';
      input.onchange = (e) => {
        const file = e.target.files[0];
        onFileSelect(file);
        handleClose();
      };
      input.click();
    } else {
      // Implement Google Drive/Dropbox integration here
      alert(`Connect to ${source} integration`);
      handleClose();
    }
  };

  return (
    <>
      <IconButton onClick={handleClick}>
        <Add />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => handleFileUpload('device')}>
          <ListItemIcon>
            <InsertDriveFile fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Upload from device</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleFileUpload('google-drive')}>
          <ListItemIcon>
            <CloudUpload fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Google Drive</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleFileUpload('dropbox')}>
          <ListItemIcon>
            <CloudUpload fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Dropbox</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default AttachmentMenu;