import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  Typography,
  Avatar,
  IconButton,
} from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import menuConfigs from "../configs/menu.configs";
import { setUser } from "../redux/features/userSlice";
import { Box } from "@mui/system";
import DashboardIcon from "@mui/icons-material/Dashboard";

const UserMenu = () => {
  const { user } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const [anchorEl, setAnchorEl] = useState(null);

  const toggleMenu = (e) => setAnchorEl(e.currentTarget);

  return (
    <>
      {user && (
        <>
          {/* <Typography
            variant="h6"
            sx={{ cursor: "pointer", userSelect: "none" }}
            onClick={toggleMenu}
          >
            {user.username}
          </Typography> */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              sx={{
                "&:hover": { color: "primary.main" },
                color: "primary.contrastText",
                mr: 2,
              }}
              component={Link}
              to="/main"
            >
              <DashboardIcon />
            </IconButton>
            <Avatar
              sx={{ cursor: "pointer", userSelect: "none" }}
              onClick={toggleMenu}
              // {...stringAvatar(user.username)}
            />
          </Box>
          <Menu
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={() => setAnchorEl(null)}
            PaperProps={{
              sx: { padding: 0 },
              "&:hover": { color: "primary.main" },
            }}
          >
            {menuConfigs.user.map((item, index) => (
              <ListItemButton
                component={Link}
                to={item.path}
                key={index}
                onClick={() => setAnchorEl(null)}
                sx={{
                  borderRadius: 100,
                  "&:hover": { color: "primary.main" },
                  color: "primary.contrastText",
                }}
              >
                <ListItemIcon
                  sx={{
                    "&:hover": { color: "primary.main" },
                    color: "primary.contrastText",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  disableTypography
                  primary={
                    <Typography textTransform="uppercase">
                      {item.display}
                    </Typography>
                  }
                />
              </ListItemButton>
            ))}
            <ListItemButton
              sx={{
                borderRadius: 100,
                "&:hover": { color: "primary.main" },
                color: "primary.contrastText",
              }}
              onClick={() => dispatch(setUser(null))}
            >
              <ListItemIcon
                sx={{
                  "&:hover": { color: "primary.main" },
                  color: "primary.contrastText",
                }}
              >
                <LogoutOutlinedIcon />
              </ListItemIcon>
              <ListItemText
                disableTypography
                primary={
                  <Typography textTransform="uppercase">sign out</Typography>
                }
              />
            </ListItemButton>
          </Menu>
        </>
      )}
    </>
  );
};

export default UserMenu;
