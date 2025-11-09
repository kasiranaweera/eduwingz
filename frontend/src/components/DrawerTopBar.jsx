import { Box, Stack } from "@mui/system";
import React, { useEffect, useState } from "react";
import Logo from "./common/Logo";
import UserMenu from "./UserMenu";
import {
  AppBar,
  Avatar,
  Button,
  Divider,
  Drawer,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  styled,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import menuConfigs from "../configs/menu.configs";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../redux/features/userSlice";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { themeModes } from "../configs/theme.config";
import { setThemeMode } from "../redux/features/themeModeSlice";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import SettingsInputComponentIcon from "@mui/icons-material/SettingsInputComponent";
import SearchIcon from "@mui/icons-material/Search";
import AddCommentOutlinedIcon from "@mui/icons-material/AddCommentOutlined";
import PortraitIcon from "@mui/icons-material/Portrait";
import MuiLink from "@mui/material/Link";
import uiConfigs from "../configs/ui.config";
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AddModeratorOutlinedIcon from '@mui/icons-material/AddModeratorOutlined';

const drawerWidth = (window.innerWidth / 100) * 15;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(9)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const CustomAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

const CustomDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  variants: [
    {
      props: ({ open }) => open,
      style: {
        ...openedMixin(theme),
        "& .MuiDrawer-paper": openedMixin(theme),
      },
    },
    {
      props: ({ open }) => !open,
      style: {
        ...closedMixin(theme),
        "& .MuiDrawer-paper": closedMixin(theme),
      },
    },
  ],
}));

const DrawerTopBar = ({ special, content }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.user);
  const { themeMode } = useSelector((state) => state.themeMode);
  const { appState } = useSelector((state) => state.appState);

  // Ensure user is loaded
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser && !user) {
      dispatch(setUser(JSON.parse(savedUser)));
    }
  }, [dispatch, user]);

  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorEl2, setAnchorEl2] = useState(null);
  const toggleMenu = (e) => setAnchorEl(e.currentTarget);
  const toggleMenu2 = (e) => setAnchorEl2(e.currentTarget);

  const [open, setOpen] = React.useState(false);

  const onSwithTheme = () => {
    const theme =
      themeMode === themeModes.dark ? themeModes.light : themeModes.dark;
    dispatch(setThemeMode(theme));
  };

  const handleDrawer = () => {
    if (open) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  };

  const dashboardType = location.pathname.includes("/dashboard/chat")
    ? "Chat"
    : location.pathname.includes("/dashboard/platform")
    ? "Platform"
    : location.pathname.includes("/dashboard/profile")
    ? "Profile"
    : null;

  return special === "true" ? (
    <Box sx={{ display: "flex" }}>
      <CustomAppBar sx={{ p: 0, m: 0 }} position="fixed">
        <Box
          sx={{
            backgroundColor: "background.paper",
            height: "72px",
            display: "flex",
            px: 2,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Stack direction="row" sx={{ alignItems: "center" }} spacing={2}>
            <IconButton
              sx={{
                "&:hover": { color: "primary.main" },
                color: "primary.contrastText",
              }}
              onClick={handleDrawer}
            >
              <MenuIcon />
            </IconButton>
            <Divider orientation="vertical" flexItem />
            <Logo />
            {dashboardType === "Chat" ? (
              <Typography variant="h5" sx={{ fontWeight: "500" }}>
                | Chat
              </Typography>
            ) : dashboardType === "Platform" ? (
              <Typography variant="h5" sx={{ fontWeight: "500" }}>
                | Platform
              </Typography>
            ) : (
              <></>
            )}
          </Stack>
          <Box
            sx={{
              display: "flex",
              border: 1,
              pl: 1,
              borderRadius: 100,
              width: "20vw",
            }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Search Now..."
              inputProps={{}}
            />
            {/* <Divider sx={{}} orientation="vertical" flexItem /> */}
            <IconButton
              sx={{
                "&:hover": { color: "primary.main" },
                color: "primary.contrastText",
              }}
            >
              <SearchIcon />
            </IconButton>
          </Box>
          <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
            <IconButton
              sx={{
                "&:hover": { color: "primary.main" },
                color: "primary.contrastText",
              }}
            >
              <NotificationsActiveIcon />
            </IconButton>
            <IconButton
              sx={{
                "&:hover": { color: "primary.main" },
                color: "primary.contrastText",
              }}
              href="/main"
            >
              <DashboardIcon />
            </IconButton>
            <IconButton
              sx={{
                "&:hover": { color: "primary.main" },
                color: "primary.contrastText",
              }}
              onClick={onSwithTheme}
            >
              {themeMode === themeModes.light && <DarkModeOutlinedIcon />}
              {themeMode === themeModes.dark && <WbSunnyOutlinedIcon />}
            </IconButton>
            <IconButton
            href="/dashboard/settings"
              sx={{
                "&:hover": { color: "primary.main" },
                color: "primary.contrastText",
              }}
            >
              <SettingsOutlinedIcon />
            </IconButton>
          </Stack>
        </Box>
      </CustomAppBar>
      <CustomDrawer variant="permanent" open={open}>
        <DrawerHeader sx={{ mt: 1 }}></DrawerHeader>
        {open && (
          <Box
            sx={{
              display: "flow",
              justifyItems: "center",
              height: window.innerHeight - 72,
              alignContent: "space-between",
            }}
          >
            <Box sx={{ height: window.innerHeight - 72 - 56 }}>
              <Stack
                spacing={1}
                direction="column"
                sx={{
                  alignItems: "center",
                  p: 2,
                }}
              >
                {dashboardType === "Chat" ? (<Stack spacing={1}>
                  <ListItemButton
                    sx={{
                      width: "12vw",
                      px: 3,
                      color: appState.includes("newchat")
                        ? "secondary.contrastText"
                        : "primary.contrastText",
                      borderRadius: 100,
                      marginY: 1,
                      "&:hover": {
                        color: appState.includes("newchat")
                          ? "secondary.contrastText"
                          : "primary.main",
                      },
                      background: appState.includes("newchat")
                        ? uiConfigs.style.mainGradient.color
                        : "none",
                    }}
                    component={Link}
                    to="/dashboard/chat/new"
                  >
                    <AddCommentOutlinedIcon />
                    <ListItemText
                      sx={{ ml: 2, textAlign: "left", fontWeight: 800 }}
                      disableTypography
                      primary={
                        <Typography textTransform="uppercase">
                          New chat
                        </Typography>
                      }
                    />
                  </ListItemButton>
                  <Divider orientation="horizontal" flexItem />
                  {menuConfigs.dashboardChat.map((item, index) => (
                    <ListItemButton
                      key={item.path || item.display || index}
                      sx={{
                        width: "12vw",
                        px: 3,
                        color: appState.includes(item.state)
                          ? "secondary.contrastText"
                          : "primary.contrastText",
                        borderRadius: 100,
                        marginY: 1,
                        "&:hover": {
                          color: appState.includes(item.state)
                            ? "secondary.contrastText"
                            : "primary.main",
                        },
                        background: appState.includes(item.state)
                          ? uiConfigs.style.mainGradient.color
                          : "none",
                      }}
                      component={Link}
                      to={item.path}
                    >
                      {item.icon}
                      <ListItemText
                        sx={{ ml: 2, textAlign: "left", fontWeight: 800 }}
                        disableTypography
                        primary={
                          <Typography textTransform="uppercase">
                            {item.display}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  ))}
                </Stack>) : dashboardType === "Platform" ? (<>
                {menuConfigs.dashboardPlatform.map((item, index) => (
                    <ListItemButton
                      key={item.path || item.display || index}
                      sx={{
                        width: "12vw",
                        px: 3,
                        color: appState.includes(item.state)
                          ? "secondary.contrastText"
                          : "primary.contrastText",
                        borderRadius: 100,
                        marginY: 1,
                        "&:hover": {
                          color: appState.includes(item.state)
                            ? "secondary.contrastText"
                            : "primary.main",
                        },
                        background: appState.includes(item.state)
                          ? uiConfigs.style.mainGradient.color
                          : "none",
                      }}
                      component={Link}
                      to={item.path}
                    >
                      {item.icon}
                      <ListItemText
                        sx={{ ml: 2, textAlign: "left", fontWeight: 800 }}
                        disableTypography
                        primary={
                          <Typography textTransform="uppercase">
                            {item.display}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  ))}</>) : (<></>)}

                
                <Divider orientation="horizontal" flexItem />
                  {menuConfigs.dashboardCommon.map((item, index) => (
                    <ListItemButton
                      key={item.path || item.display || index}
                    sx={{
                      width: "12vw",
                      px: 3,
                      color: appState.includes(item.state)
                        ? "secondary.contrastText"
                        : "primary.contrastText",
                      borderRadius: 100,
                      marginY: 1,
                      "&:hover": {
                        color: appState.includes(item.state)
                          ? "secondary.contrastText"
                          : "primary.main",
                      },
                      background: appState.includes(item.state)
                        ? uiConfigs.style.mainGradient.color
                        : "none",
                    }}
                    component={Link}
                    to={item.path}
                  >
                    {item.icon}
                    <ListItemText
                      sx={{ ml: 2, textAlign: "left", fontWeight: 800 }}
                      disableTypography
                      primary={
                        <Typography textTransform="uppercase">
                          {item.display}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                ))}
                <Divider orientation="horizontal" flexItem />
                {dashboardType === "Chat" ? (<ListItemButton
                  sx={{
                    width: "12vw",
                    px: 3,
                    color: appState.includes("eduplatform")
                      ? "secondary.contrastText"
                      : "primary.contrastText",
                    borderRadius: 100,
                    marginY: 1,
                    "&:hover": {
                      color: appState.includes("eduplatform")
                        ? "secondary.contrastText"
                        : "primary.main",
                    },
                    background: appState.includes("eduplatform")
                      ? uiConfigs.style.mainGradient.color
                      : "none",
                  }}
                  component={Link}
                  to="/dashboard/platform"
                >
                  <DashboardIcon />
                  <ListItemText
                    sx={{ ml: 2, textAlign: "left", fontWeight: 800 }}
                    disableTypography
                    primary={
                      <Typography textTransform="uppercase">
                        Edu - Platform
                      </Typography>
                    }
                  />
                </ListItemButton>):(<ListItemButton
                  sx={{
                    width: "12vw",
                    px: 3,
                    color: appState.includes("eduplatform")
                      ? "secondary.contrastText"
                      : "primary.contrastText",
                    borderRadius: 100,
                    marginY: 1,
                    "&:hover": {
                      color: appState.includes("eduplatform")
                        ? "secondary.contrastText"
                        : "primary.main",
                    },
                    background: appState.includes("eduplatform")
                      ? uiConfigs.style.mainGradient.color
                      : "none",
                  }}
                  component={Link}
                  to="/dashboard/chat/new"
                >
                  <DashboardIcon />
                  <ListItemText
                    sx={{ ml: 2, textAlign: "left", fontWeight: 800 }}
                    disableTypography
                    primary={
                      <Typography textTransform="uppercase">
                        Edu - Chat
                      </Typography>
                    }
                  />
                </ListItemButton>)}
              </Stack>
            </Box>
            <Box
              onClick={toggleMenu2}
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              {user && (
                <Avatar
                  sx={{
                    cursor: "pointer",
                    userSelect: "none",
                    textTransform: "uppercase",
                  }}
                >
                  {user.username[0]}
                </Avatar>
              )}
              {!user && (
                <Avatar sx={{ cursor: "pointer", userSelect: "none" }} />
              )}
              <Box>
                <Typography>@{user.username}</Typography>
                <Typography variant="body2" sx={{ fontWeight: "300" }}>
                  {user.email}
                </Typography>
              </Box>
            </Box>
            <Menu
              open={Boolean(anchorEl2)}
              anchorEl={anchorEl2}
              onClose={() => setAnchorEl2(null)}
              PaperProps={{
                sx: { padding: 1 },
                "&:hover": { color: "primary.main" },
              }}
            >
              <ListItemButton
                component={Link}
                to="/dashboard/profile"
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
                  <PortraitIcon />
                </ListItemIcon>
                <ListItemText
                  disableTypography
                  primary={
                    <Typography textTransform="uppercase">profile</Typography>
                  }
                />
              </ListItemButton>
              <ListItemButton
                component={Link}
                to="/dashboard/updates"
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
                  <AddModeratorOutlinedIcon />
                </ListItemIcon>
                <ListItemText
                  disableTypography
                  primary={
                    <Typography textTransform="uppercase">Updates</Typography>
                  }
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
          </Box>
        )}
        {!open && (
          <Box
            sx={{
              display: "flow",
              justifyItems: "center",
              height: window.innerHeight - 72,
              alignContent: "space-between",
            }}
          >
            <Stack
              spacing={1}
              direction="column"
              sx={{
                alignItems: "center",
                p: 2,
                height: window.innerHeight - 72 - 56,
              }}
            >
              {dashboardType === "Chat" ? (
                <Stack spacing={1}>
                  <IconButton
                    sx={{
                      color: appState.includes("newchat")
                        ? "secondary.contrastText"
                        : "primary.contrastText",
                      "&:hover": {
                        color: appState.includes("newchat")
                          ? "secondary.contrastText"
                          : "primary.main",
                      },
                      background: appState.includes("newchat")
                        ? uiConfigs.style.mainGradient.color
                        : "none",
                    }}
                    href="/dashboard/chat/new"
                  >
                    <AddCommentOutlinedIcon />
                  </IconButton>
                  <Divider orientation="horizontal" flexItem />
                  {menuConfigs.dashboardChat.map((item, index) => (
                    <List disablePadding key={item.path || item.display || index}>
                      <ListItem disablePadding>
                        <IconButton
                          sx={{
                            "&:hover": {
                              color: appState.includes(item.state)
                                ? "secondary.contrastText"
                                : "primary.main",
                            },
                            color: appState.includes(item.state)
                              ? "secondary.contrastText"
                              : "primary.contrastText",
                            background: appState.includes(item.state)
                              ? uiConfigs.style.mainGradient.color
                              : "none",
                          }}
                          href={item.path}
                        >
                          {item.icon}
                        </IconButton>
                      </ListItem>
                    </List>
                  ))}
                </Stack>
              ) : dashboardType === "Platform" ? (
                <>{menuConfigs.dashboardPlatform.map((item, index) => (
                    <List disablePadding key={item.path || item.display || index}>
                      <ListItem disablePadding>
                        <IconButton
                          sx={{
                            "&:hover": {
                              color: appState.includes(item.state)
                                ? "secondary.contrastText"
                                : "primary.main",
                            },
                            color: appState.includes(item.state)
                              ? "secondary.contrastText"
                              : "primary.contrastText",
                            background: appState.includes(item.state)
                              ? uiConfigs.style.mainGradient.color
                              : "none",
                          }}
                          href={item.path}
                        >
                          {item.icon}
                        </IconButton>
                      </ListItem>
                    </List>
                  ))}</>
              ) : (
                <></>
              )}
              <Divider orientation="horizontal" flexItem />
              {menuConfigs.dashboardCommon.map((item, index) => (
                <List disablePadding key={item.path || item.display || index}>
                  <ListItem disablePadding>
                    <IconButton
                      sx={{
                        "&:hover": {
                          color: appState.includes(item.state)
                            ? "secondary.contrastText"
                            : "primary.main",
                        },
                        color: appState.includes(item.state)
                          ? "secondary.contrastText"
                          : "primary.contrastText",
                        background: appState.includes(item.state)
                          ? uiConfigs.style.mainGradient.color
                          : "none",
                      }}
                      href={item.path}
                    >
                      {item.icon}
                    </IconButton>
                  </ListItem>
                </List>
              ))}
              <Divider orientation="horizontal" flexItem />
              {dashboardType === "Chat" ? (<IconButton
                sx={{
                  color: appState.includes("eduplatform")
                    ? "secondary.contrastText"
                    : "primary.contrastText",
                  "&:hover": {
                    color: appState.includes("eduplatform")
                      ? "secondary.contrastText"
                      : "primary.main",
                  },
                  background: appState.includes("eduplatform")
                    ? uiConfigs.style.mainGradient.color
                    : "none",
                }}
                href="/dashboard/platform"
              >
                <DashboardIcon />
              </IconButton>) : dashboardType === "Platform" ? (<IconButton
                sx={{
                  color: appState.includes("eduplatform")
                    ? "secondary.contrastText"
                    : "primary.contrastText",
                  "&:hover": {
                    color: appState.includes("eduplatform")
                      ? "secondary.contrastText"
                      : "primary.main",
                  },
                  background: appState.includes("eduplatform")
                    ? uiConfigs.style.mainGradient.color
                    : "none",
                }}
                href="/dashboard/chat/new"
              >
                <DashboardIcon />
              </IconButton>) : (<IconButton
                sx={{
                  color: appState.includes("eduplatform")
                    ? "secondary.contrastText"
                    : "primary.contrastText",
                  "&:hover": {
                    color: appState.includes("eduplatform")
                      ? "secondary.contrastText"
                      : "primary.main",
                  },
                  background: appState.includes("eduplatform")
                    ? uiConfigs.style.mainGradient.color
                    : "none",
                }}
                href="/main"
              >
                <DashboardIcon />
              </IconButton>)} 
            </Stack>
            <Box sx={{}}>
              {user && (
                <Avatar
                  sx={{
                    cursor: "pointer",
                    userSelect: "none",
                    textTransform: "uppercase",
                  }}
                  onClick={toggleMenu2}
                >
                  {user.username[0]}
                </Avatar>
              )}
              {!user && (
                <Avatar
                  sx={{ cursor: "pointer", userSelect: "none" }}
                  onClick={toggleMenu2}
                />
              )}
            </Box>
            <Menu
              open={Boolean(anchorEl2)}
              anchorEl={anchorEl2}
              onClose={() => setAnchorEl2(null)}
              PaperProps={{
                sx: { padding: 0 },
                "&:hover": { color: "primary.main" },
              }}
            >
              <ListItemButton
                component={Link}
                to="/dashboard/profile"
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
                  <PortraitIcon />
                </ListItemIcon>
                <ListItemText
                  disableTypography
                  primary={
                    <Typography textTransform="uppercase">profile</Typography>
                  }
                />
              </ListItemButton>
              <ListItemButton
                component={Link}
                to="/dashboard/updates"
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
                  <AddModeratorOutlinedIcon />
                </ListItemIcon>
                <ListItemText
                  disableTypography
                  primary={
                    <Typography textTransform="uppercase">Updates</Typography>
                  }
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
          </Box>
        )}
      </CustomDrawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        {content}
      </Box>
    </Box>
  ) : (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: 1,
        px: 2,
        borderColor: "primary.main",
        height: "72px",
        backgroundColor: "background.paper",
      }}
    >
      <Button
        sx={{
          backgroundColor: "graycolor.one",
          px: 3,
          borderRadius: 100,
          color: "primary.contrastText",
          "&:hover": { color: "primary.main" },
        }}
        component={Link}
        to="/home"
      >
        Home
      </Button>
      <Logo />
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton
          sx={{
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
        <Avatar
          sx={{
            cursor: "pointer",
            userSelect: "none",
            textTransform: "uppercase",
          }}
          onClick={toggleMenu}
          // {...stringAvatar(user.username)}
        >
          {/* {user.username[0]} */}{user.username[0]}
        </Avatar>
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
    </Box>
  );
};

export default DrawerTopBar;
