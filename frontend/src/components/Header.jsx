import {
  AppBar,
  Box,
  Button,
  IconButton,
  Stack,
  Toolbar,
  useScrollTrigger,
} from "@mui/material";
import React, { cloneElement, useState } from "react";
import Logo from "./common/Logo";
import menuConfigs from "../configs/menu.configs";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import themeConfigs, { themeModes } from "../configs/theme.config";
import { setThemeMode } from "../redux/features/themeModeSlice";
import UserMenu from "./UserMenu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { setAuthModalOpen } from "../redux/features/authModalSlice";
import uiConfigs from "../configs/ui.config";
import MenuIcon from "@mui/icons-material/Menu";
import Sidebar from "./Sidebar";

const ScrollAppBar = ({ children, window }) => {
  const { themeMode } = useSelector((state) => state.themeMode);

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 50,
    target: window ? window() : undefined,
  });

  return cloneElement(children, {
    sx: {
      color: trigger
        ? "text.primary"
        : themeMode === themeModes.dark
        ? "primary.contrastText"
        : "text.primary",
      backgroundColor: trigger
        ? "transparent"
        : themeMode === themeModes.dark
        ? "transparent"
        : "transparent",
      boxShadow: "none",
    },
  });
};

const Header = () => {
  const { user } = useSelector((state) => state.user);
  const { themeMode } = useSelector((state) => state.themeMode);
  const { appState } = useSelector((state) => state.appState);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  console.log('userdata 123', user);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const onSwithTheme = () => {
    const theme =
      themeMode === themeModes.dark ? themeModes.light : themeModes.dark;
    dispatch(setThemeMode(theme));
  };

  // const buttonHandle = () => {
  //   dispatch(setAuthModalOpen(true));
  //   // navigate("/auth");
  // }

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <>
      <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
      <ScrollAppBar>
        <AppBar
          position="sticky"
          sx={{
            backgroundColor: "none",
            boxShadow: "none",
          }}
        >
          <Toolbar
            disableGutters
            sx={{
              backgroundColor: "none",
              boxShadow: "none",
              // backdropFilter: `blur(5px)`,
            }}
          >
            <Box
              sx={{
                width: "100vw",
                height: "80px",
                justifyContent: "center",
                display: "flex",
                alignItems: "center",
                backgroundColor: themeMode === themeModes.dark ? "#121212" : "#ffffff",
              }}
            >
              <Box
                sx={{
                  width: "95%",
                  height: "72px",
                  border: 2,
                  borderColor:
                    themeMode === themeModes.dark
                      ? "primary.main"
                      : "primary.main",
                  borderRadius: 100,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  position: "relative",
                  padding: "12px",
                  backgroundColor: "background.default",
                }}
              >
                <IconButton
                  sx={{
                    display: { xs: "flex", md: "none" },
                    "&:hover": { color: "primary.main" },
                    color:
                      themeMode === themeModes.dark
                        ? "primary.contrastText"
                        : "primary.contrastText",
                  }}
                  onClick={toggleSidebar}
                >
                  <MenuIcon />
                </IconButton>
                <Logo />
                <Box
                  sx={{
                    display: { xs: "none", md: "block" },
                    justifyContent: "center",
                    alignItems: "center",
                    position: "relative",
                  }}
                >
                  {menuConfigs.main.map((item, index) => (
                    <Button
                      key={index}
                      sx={
                        appState.includes(item.state)
                          ? {
                              mr: 1,
                              borderRadius: 100,
                              background: uiConfigs.style.mainGradient.color,
                              color:
                                themeMode === themeModes.dark
                                  ? "secondary.contrastText"
                                  : "primary.contrastText",
                            }
                          : {
                              mr: 1,
                              "&:hover": { color: "primary.main" },
                              borderRadius: 100,
                              color:
                                themeMode === themeModes.dark
                                  ? "primary.contrastText"
                                  : "primary.contrastText",
                            }
                      }
                      component={Link}
                      to={item.path}
                      variant={
                        appState.includes(item.state) ? "contained" : "text"
                      }
                    >
                      {item.display}
                    </Button>
                  ))}
                </Box>
                <Stack spacing={1} direction="row" alignItems="center">
                  <IconButton
                    sx={{
                      display: { xs: "none", md: "flex" },
                      "&:hover": { color: "primary.main" },
                      color:
                        themeMode === themeModes.dark
                          ? "primary.contrastText"
                          : "primary.contrastText",
                    }}
                    onClick={onSwithTheme}
                  >
                    {themeMode === themeModes.light && <DarkModeOutlinedIcon />}
                    {themeMode === themeModes.dark && <WbSunnyOutlinedIcon />}
                  </IconButton>
                  {!user && (
                    <Button
                      variant="contained"
                      onClick={() => {
                        // navigate("/auth");
                        dispatch(setAuthModalOpen(true));
                      }}
                      sx={{
                        background: uiConfigs.style.mainGradient.color,
                        borderRadius: 100,
                        color:
                          themeMode === themeModes.dark
                            ? "secondary.contrastText"
                            : "primary.contrastText",
                      }}
                    >
                      sign in
                    </Button>
                  )}
                  {user && <UserMenu />}
                </Stack>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>
      </ScrollAppBar>
    </>
  );
};

export default Header;
