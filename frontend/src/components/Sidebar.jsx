import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Stack, Toolbar, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import menuConfigs from "../configs/menu.configs";
import Logo from "./common/Logo";
import uiConfigs from "../configs/ui.config";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";

import { themeModes } from "../configs/theme.config";
import { setThemeMode } from "../redux/features/themeModeSlice";

const Sidebar = ({ open, toggleSidebar }) => {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.user);
  const { appState } = useSelector((state) => state.appState);
  const { themeMode } = useSelector((state) => state.themeMode);

  const sidebarWidth = uiConfigs.size.sidebarWith;

  const onSwitchTheme = () => {
    const theme = themeMode === themeModes.dark ? themeModes.light : themeModes.dark;
    dispatch(setThemeMode(theme));
  };

  const drawer = (
    <>
      <Toolbar sx={{ paddingY: "20px", color: "text.primary" }}>
        <Stack width="100%" direction="row" justifyContent="center">
          <Logo />
        </Stack>
      </Toolbar>
      <List sx={{ paddingX: "30px" }}>
        <Typography sx={{color: 'primary.contrastText'}} variant="h6" marginBottom="20px">MENU</Typography>
        {menuConfigs.main.map((item, index) => (
          <ListItemButton
            key={index}
            sx={{
              color: appState.includes(item.state) ? "secondary.contrastText" : "primary.contrastText",
              borderRadius: 100,
              marginY: 1,
              '&:hover': {color: appState.includes(item.state) ? 'secondary.contrastText' : 'primary.main'},
              background: appState.includes(item.state) ? uiConfigs.style.mainGradient.color : "unset"
            }}
            component={Link}
            to={item.path}
            onClick={() => toggleSidebar(false)}
          >
            <ListItemText sx={{textAlign:'center'}} disableTypography primary={<Typography textTransform="uppercase">
              {item.display}
            </Typography>} />
          </ListItemButton>
        ))}

        {user && (<>
          <Typography sx={{color: 'primary.contrastText'}} variant="h6" marginBottom="20px">PERSONAL</Typography>
          {menuConfigs.user.map((item, index) => (
            <ListItemButton
              key={index}
              sx={{
                borderRadius: "10px",
                '&:hover': {color: appState.includes(item.state) ? 'secondary.contrastText' : 'primary.main'},
                marginY: 1,
                backgroundColor: appState.includes(item.state) ? "primary.main" : "unset"
              }}
              component={Link}
              to={item.path}
              onClick={() => toggleSidebar(false)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText disableTypography primary={<Typography textTransform="uppercase">
                {item.display}
              </Typography>} />
            </ListItemButton>
          ))}
        </>)}

        <Typography variant="h6" marginBottom="20px">THEME</Typography>
        <ListItemButton sx={{borderRadius:100, '&:hover': {color: 'primary.main'},}} onClick={onSwitchTheme}>
          <ListItemIcon sx={{'&:hover': {color: 'primary.main'},}}>
            {themeMode === themeModes.light && <DarkModeOutlinedIcon />}
            {themeMode === themeModes.dark && <WbSunnyOutlinedIcon />}
          </ListItemIcon>
          <ListItemText disableTypography primary={
            <Typography textTransform="uppercase">
              {themeMode === themeModes.dark ? "light mode" : "dark mode"}
            </Typography>
          } />
        </ListItemButton>
      </List>
    </>
  );

  return (
    <Drawer
      open={open}
      onClose={() => toggleSidebar(false)}
      sx={{
        "& .MuiDrawer-Paper": {
          boxSizing: "border-box",
          widh: sidebarWidth,
          borderRight: "0px"
        }
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default Sidebar;