import { useState } from "react";
import { Avatar, Box, IconButton, Menu, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../redux/features/userSlice";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import PortraitIcon from "@mui/icons-material/Portrait";

const UserProfileMenu = ({ open }) => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);

  const toggleMenu = (e) => setAnchorEl(e.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  return (
    <>
      <Box onClick={toggleMenu} sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}>
        <Avatar sx={{ userSelect: 'none', textTransform: 'uppercase' }}>
          {user?.username?.[0] || ''}
        </Avatar>
        {open && (
          <Box>
            <Typography>@{user?.username || 'user'}</Typography>
            <Typography variant="body2" sx={{ fontWeight: "300" }}>
              {user?.email || 'email@example.com'}
            </Typography>
          </Box>
        )}
      </Box>

      <Menu
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={closeMenu}
        PaperProps={{
          sx: { padding: 0 },
          "&:hover": { color: "primary.main" },
        }}
      >
        <ListItemButton
          component={Link}
          to="/dashboard/profile"
          onClick={closeMenu}
          sx={{
            borderRadius: 100,
            "&:hover": { color: "primary.main" },
            color: "primary.contrastText",
          }}
        >
          <ListItemIcon sx={{ color: "primary.contrastText" }}>
            <PortraitIcon />
          </ListItemIcon>
          <ListItemText
            disableTypography
            primary={<Typography textTransform="uppercase">profile</Typography>}
          />
        </ListItemButton>
        <ListItemButton
          sx={{
            borderRadius: 100,
            "&:hover": { color: "primary.main" },
            color: "primary.contrastText",
          }}
          onClick={() => dispatch(setUser(null))}
        >
          <ListItemIcon sx={{ color: "primary.contrastText" }}>
            <LogoutOutlinedIcon />
          </ListItemIcon>
          <ListItemText
            disableTypography
            primary={<Typography textTransform="uppercase">sign out</Typography>}
          />
        </ListItemButton>
      </Menu>
    </>
  );
};

export default UserProfileMenu;