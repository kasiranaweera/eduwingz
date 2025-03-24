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

  const onSwithTheme = () => {
    const theme =
      themeMode === themeModes.dark ? themeModes.light : themeModes.dark;
    dispatch(setThemeMode(theme));
  };

  const buttonHandle = () => {
    dispatch(setAuthModalOpen(true));
    navigate("/auth");
  }

  return (
    <ScrollAppBar>
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: "transparent",
          boxShadow: "none",
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            backgroundColor: "transparent",
            boxShadow: "none",
            backdropFilter: `blur(5px)`,
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "80px",
              justifyContent: "center",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                width: "95%",
                height: "64px",
                border: 2,
                borderColor:
                  themeMode === themeModes.dark
                    ? "primary.main"
                    : "primary.main",
                borderRadius: 5,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "relative",
                padding: "12px",
              }}
            >
              <Logo />
              <Box
                sx={{
                  display: "block",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative",
                }}
              >
                {menuConfigs.main.map((item, index) => (
                  <Button
                    key={index}
                    sx={appState.includes(item.state) ? {mr: 1,
                        color:
                          themeMode === themeModes.dark
                            ? "secondary.contrastText"
                            : "primary.contrastText",}:{mr: 1,
                                color:
                                  themeMode === themeModes.dark
                                    ? "primary.contrastText"
                                    : "primary.contrastText",}}
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
                    onClick={buttonHandle}
                    sx={{color:
                      themeMode === themeModes.dark
                        ? "secondary.contrastText"
                        : "primary.contrastText",}}
                  >
                    sign in
                  </Button>
                )}
              </Stack>
              {user && <UserMenu />}
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
    </ScrollAppBar>
  );
};

export default Header;
