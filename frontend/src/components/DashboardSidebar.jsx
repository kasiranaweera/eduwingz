import { Box, Stack, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import uiConfigs from "../configs/ui.config";
import menuConfigs from "../configs/menu.configs";
import AddCommentOutlinedIcon from "@mui/icons-material/AddCommentOutlined";
import DashboardIcon from "@mui/icons-material/Dashboard";

const Sidebar = ({ open, appState }) => {
  return (
    <>
      <Box sx={{ height: window.innerHeight - 72 - 56 }}>
        <Stack spacing={1} direction="column" sx={{ alignItems: "center", p: 2 }}>
          <ListItemButton
            sx={{
              width: open ? '12vw' : 'auto', 
              px: 3,
              color: appState.includes('newchat') ? "secondary.contrastText" : "primary.contrastText",
              borderRadius: 100,
              marginY: 1,
              "&:hover": {
                color: appState.includes('newchat') ? "secondary.contrastText" : "primary.main",
              },
              background: appState.includes('newchat') ? uiConfigs.style.mainGradient.color : "red",
            }}
            component={Link}
            to="/dashboard/new-chat"
          >
            <AddCommentOutlinedIcon />
            {open && (
              <ListItemText
                sx={{ ml: 2, textAlign: "left", fontWeight: 800 }}
                disableTypography
                primary={<Typography textTransform="uppercase">New chat</Typography>}
              />
            )}
          </ListItemButton>
          <Divider orientation="horizontal" flexItem />
          
          {menuConfigs.dashboardChat.map((item, index) => (
            <List disablePadding key={index}>
              <ListItem disablePadding>
                <ListItemButton
                  sx={{
                    width: open ? '12vw' : 'auto',
                    px: 3,
                    color: appState.includes(item.state) ? "secondary.contrastText" : "primary.contrastText",
                    borderRadius: 100,
                    marginY: 1,
                    "&:hover": {
                      color: appState.includes(item.state) ? "secondary.contrastText" : "primary.main",
                    },
                    background: appState.includes(item.state) ? uiConfigs.style.mainGradient.color : "red",
                  }}
                  component={Link}
                  to={item.path}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  {open && (
                    <ListItemText
                      sx={{ ml: 2, textAlign: "left", fontWeight: 800 }}
                      disableTypography
                      primary={<Typography textTransform="uppercase">{item.display}</Typography>}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            </List>
          ))}
          
          <Divider orientation="horizontal" flexItem />
          
          <ListItemButton
            sx={{
              width: open ? '12vw' : 'auto',
              px: 3,
              color: appState.includes('newchat') ? "secondary.contrastText" : "primary.contrastText",
              borderRadius: 100,
              marginY: 1,
              "&:hover": {
                color: appState.includes('newchat') ? "secondary.contrastText" : "primary.main",
              },
              background: appState.includes('newchat') ? uiConfigs.style.mainGradient.color : "unset",
            }}
            component={Link}
            to="/dashboard/chat"
          >
            <DashboardIcon />
            {open && (
              <ListItemText
                sx={{ ml: 2, textAlign: "left", fontWeight: 800 }}
                disableTypography
                primary={<Typography textTransform="uppercase">Edu - Platform</Typography>}
              />
            )}
          </ListItemButton>
        </Stack>
      </Box>
    </>
  );
};

export default Sidebar;