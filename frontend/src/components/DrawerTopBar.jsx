import { Box, Stack } from "@mui/system";
import React, { useEffect, useState } from "react";
import Logo from "./common/Logo";
import {
  AppBar,
  Avatar,
  Button,
  Divider,
  Drawer,
  Badge,
  CircularProgress,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  styled,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
  ClickAwayListener,
  Paper,
  Popover,
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
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import SearchIcon from "@mui/icons-material/Search";
import AddCommentOutlinedIcon from "@mui/icons-material/AddCommentOutlined";
import PortraitIcon from "@mui/icons-material/Portrait";
import uiConfigs from "../configs/ui.config";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AddModeratorOutlinedIcon from "@mui/icons-material/AddModeratorOutlined";
import { ChatOutlined, LocalLibraryOutlined, Dashboard as DashboardIcon } from "@mui/icons-material";
import searchApi from "../api/modules/search.api";
import userApi from "../api/modules/user.api";

const drawerWidth = 240;

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
  ...theme.mixins.toolbar,
}));

const CustomAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== "open" && prop !== "isMobile",
})(({ theme, isMobile }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  // On mobile, always full width
  ...(isMobile && {
    width: "100%",
    marginLeft: 0,
  }),
  variants: [
    {
      props: ({ open }) => open && !isMobile,
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

// Reusable sidebar content component
const SidebarContent = ({ open, dashboardType, appState, user, dispatch, toggleMenu2, isMobile, handleClose }) => {
  const sidebarItemWidth = open ? "100%" : "auto";

  const handleLinkClick = () => {
    if (isMobile && handleClose) handleClose();
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "calc(100vh - 72px)",
      }}
    >
      <Box sx={{ flex: 1, overflow: "auto" }}>
        <Stack
          spacing={1}
          direction="column"
          sx={{ alignItems: "center", p: 2 }}
        >
          {dashboardType === "Chat" ? (
            <Stack spacing={1} sx={{ width: "100%" }}>
              <ListItemButton
                sx={{
                  width: open ? "100%" : 48,
                  minWidth: open ? "auto" : 48,
                  minHeight: 48,
                  justifyContent: open ? "flex-start" : "center",
                  px: open ? 3 : 0,
                  color: appState.includes("newchat") ? "secondary.contrastText" : "primary.contrastText",
                  borderRadius: open ? 100 : "50%",
                  marginY: 1,
                  "&:hover": {
                    color: appState.includes("newchat") ? "secondary.contrastText" : "primary.main",
                  },
                  background: appState.includes("newchat") ? uiConfigs.style.mainGradient.color : "none",
                }}
                component={Link}
                to="/dashboard/chat/new"
                onClick={handleLinkClick}
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
                <ListItemButton
                  key={item.path || item.display || index}
                  sx={{
                    width: open ? "100%" : 48,
                    minWidth: open ? "auto" : 48,
                    minHeight: 48,
                    justifyContent: open ? "flex-start" : "center",
                    px: open ? 3 : 0,
                    color: appState.includes(item.state) ? "secondary.contrastText" : "primary.contrastText",
                    borderRadius: open ? 100 : "50%",
                    marginY: 1,
                    "&:hover": {
                      color: appState.includes(item.state) ? "secondary.contrastText" : "primary.main",
                    },
                    background: appState.includes(item.state) ? uiConfigs.style.mainGradient.color : "none",
                  }}
                  component={Link}
                  to={item.path}
                  onClick={handleLinkClick}
                >
                  {open ? item.icon : (
                    <Tooltip title={item.display} placement="right" arrow>
                      {item.icon}
                    </Tooltip>
                  )}
                  {open && (
                    <ListItemText
                      sx={{ ml: 2, textAlign: "left", fontWeight: 800 }}
                      disableTypography
                      primary={<Typography textTransform="uppercase">{item.display}</Typography>}
                    />
                  )}
                </ListItemButton>
              ))}
            </Stack>
          ) : dashboardType === "Platform" ? (
            <>
              {menuConfigs.dashboardPlatform.map((item, index) => (
                <ListItemButton
                  key={item.path || item.display || index}
                  sx={{
                    width: open ? "100%" : 48,
                    minWidth: open ? "auto" : 48,
                    minHeight: 48,
                    justifyContent: open ? "flex-start" : "center",
                    px: open ? 3 : 0,
                    color: appState.includes(item.state) ? "secondary.contrastText" : "primary.contrastText",
                    borderRadius: open ? 100 : "50%",
                    marginY: 1,
                    "&:hover": {
                      color: appState.includes(item.state) ? "secondary.contrastText" : "primary.main",
                    },
                    background: appState.includes(item.state) ? uiConfigs.style.mainGradient.color : "none",
                  }}
                  component={Link}
                  to={item.path}
                  onClick={handleLinkClick}
                >
                  {open ? item.icon : (
                    <Tooltip title={item.display} placement="right" arrow>
                      {item.icon}
                    </Tooltip>
                  )}
                  {open && (
                    <ListItemText
                      sx={{ ml: 2, textAlign: "left", fontWeight: 800 }}
                      disableTypography
                      primary={<Typography textTransform="uppercase">{item.display}</Typography>}
                    />
                  )}
                </ListItemButton>
              ))}
            </>
          ) : (
            <></>
          )}

          <Divider orientation="horizontal" flexItem />
          {menuConfigs.dashboardCommon.map((item, index) => (
            <ListItemButton
              key={item.path || item.display || index}
              sx={{
                width: open ? "100%" : 48,
                minWidth: open ? "auto" : 48,
                minHeight: 48,
                justifyContent: open ? "flex-start" : "center",
                px: open ? 3 : 0,
                color: appState.includes(item.state) ? "secondary.contrastText" : "primary.contrastText",
                borderRadius: open ? 100 : "50%",
                marginY: 1,
                "&:hover": {
                  color: appState.includes(item.state) ? "secondary.contrastText" : "primary.main",
                },
                background: appState.includes(item.state) ? uiConfigs.style.mainGradient.color : "none",
              }}
              component={Link}
              to={item.path}
              onClick={handleLinkClick}
            >
              {open ? item.icon : (
                <Tooltip title={item.display} placement="right" arrow>
                  {item.icon}
                </Tooltip>
              )}
              {open && (
                <ListItemText
                  sx={{ ml: 2, textAlign: "left", fontWeight: 800 }}
                  disableTypography
                  primary={<Typography textTransform="uppercase">{item.display}</Typography>}
                />
              )}
            </ListItemButton>
          ))}
          <Divider orientation="horizontal" flexItem />
          {dashboardType === "Chat" ? (
            <ListItemButton
              sx={{
                width: open ? "100%" : 48,
                minWidth: open ? "auto" : 48,
                minHeight: 48,
                justifyContent: open ? "flex-start" : "center",
                px: open ? 3 : 0,
                color: appState.includes("eduplatform") ? "secondary.contrastText" : "primary.contrastText",
                borderRadius: open ? 100 : "50%",
                marginY: 1,
                "&:hover": {
                  color: appState.includes("eduplatform") ? "secondary.contrastText" : "primary.main",
                },
                background: appState.includes("eduplatform") ? uiConfigs.style.mainGradient.color : "none",
              }}
              component={Link}
              to="/dashboard/platform"
              onClick={handleLinkClick}
            >
              {open ? <LocalLibraryOutlined /> : (
                <Tooltip title="Edu - Platform" placement="right" arrow>
                  <LocalLibraryOutlined />
                </Tooltip>
              )}
              {open && (
                <ListItemText
                  sx={{ ml: 2, textAlign: "left", fontWeight: 800 }}
                  disableTypography
                  primary={<Typography textTransform="uppercase">Edu - Platform</Typography>}
                />
              )}
            </ListItemButton>
          ) : dashboardType === "Platform" ? (
            <ListItemButton
              sx={{
                width: open ? "100%" : 48,
                minWidth: open ? "auto" : 48,
                minHeight: 48,
                justifyContent: open ? "flex-start" : "center",
                px: open ? 3 : 0,
                color: "primary.contrastText",
                borderRadius: open ? 100 : "50%",
                marginY: 1,
                "&:hover": { color: "primary.main" },
                background: "none",
              }}
              component={Link}
              to="/dashboard/chat/new"
              onClick={handleLinkClick}
            >
              {open ? <ChatOutlined /> : (
                <Tooltip title="Edu - Chat" placement="right" arrow>
                  <ChatOutlined />
                </Tooltip>
              )}
              {open && (
                <ListItemText
                  sx={{ ml: 2, textAlign: "left", fontWeight: 800 }}
                  disableTypography
                  primary={<Typography textTransform="uppercase">Edu - Chat</Typography>}
                />
              )}
            </ListItemButton>
          ) : (
            <>
              <ListItemButton
                sx={{
                  width: open ? "100%" : 48,
                  minWidth: open ? "auto" : 48,
                  minHeight: 48,
                  justifyContent: open ? "flex-start" : "center",
                  px: open ? 3 : 0,
                  color: "primary.contrastText",
                  borderRadius: open ? 100 : "50%",
                  marginY: 1,
                  "&:hover": { color: "primary.main" },
                  background: "none",
                }}
                component={Link}
                to="/dashboard/chat/new"
                onClick={handleLinkClick}
              >
                {open ? <ChatOutlined /> : (
                  <Tooltip title="Edu - Chat" placement="right" arrow>
                    <ChatOutlined />
                  </Tooltip>
                )}
                {open && (
                  <ListItemText
                    sx={{ ml: 2, textAlign: "left", fontWeight: 800 }}
                    disableTypography
                    primary={<Typography textTransform="uppercase">Edu - Chat</Typography>}
                  />
                )}
              </ListItemButton>
              <ListItemButton
                sx={{
                  width: open ? "100%" : 48,
                  minWidth: open ? "auto" : 48,
                  minHeight: 48,
                  justifyContent: open ? "flex-start" : "center",
                  px: open ? 3 : 0,
                  color: appState.includes("eduplatform") ? "secondary.contrastText" : "primary.contrastText",
                  borderRadius: open ? 100 : "50%",
                  marginY: 1,
                  "&:hover": {
                    color: appState.includes("eduplatform") ? "secondary.contrastText" : "primary.main",
                  },
                  background: appState.includes("eduplatform") ? uiConfigs.style.mainGradient.color : "none",
                }}
                component={Link}
                to="/dashboard/platform"
                onClick={handleLinkClick}
              >
                {open ? <LocalLibraryOutlined /> : (
                  <Tooltip title="Edu - Platform" placement="right" arrow>
                    <LocalLibraryOutlined />
                  </Tooltip>
                )}
                {open && (
                  <ListItemText
                    sx={{ ml: 2, textAlign: "left", fontWeight: 800 }}
                    disableTypography
                    primary={<Typography textTransform="uppercase">Edu - Platform</Typography>}
                  />
                )}
              </ListItemButton>
            </>
          )}
        </Stack>
      </Box>
      {open && (
        <Box
          onClick={toggleMenu2}
          sx={{ display: "flex", alignItems: "center", gap: 1, p: 2 }}
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
          <Box sx={{ overflow: "hidden" }}>
            <Typography noWrap>@{user?.username}</Typography>
            <Typography variant="body2" sx={{ fontWeight: "300" }} noWrap>
              {user?.email}
            </Typography>
          </Box>
        </Box>
      )}
      {!open && (
        <Box sx={{ p: 1, textAlign: "center" }}>
          {user && (
            <Tooltip title={user.username} placement="right" arrow>
              <Avatar
                sx={{
                  cursor: "pointer",
                  userSelect: "none",
                  textTransform: "uppercase",
                  mx: "auto",
                }}
                onClick={toggleMenu2}
              >
                {user.username[0]}
              </Avatar>
            </Tooltip>
          )}
          {!user && (
            <Tooltip title="Guest User" placement="right" arrow>
              <Avatar
                sx={{ cursor: "pointer", userSelect: "none", mx: "auto" }}
                onClick={toggleMenu2}
              />
            </Tooltip>
          )}
        </Box>
      )}
    </Box>
  );
};

const DrawerTopBar = ({ special, content }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.user);
  const { themeMode } = useSelector((state) => state.themeMode);
  const { appState } = useSelector((state) => state.appState);



  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorEl2, setAnchorEl2] = useState(null);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchAnchorEl, setSearchAnchorEl] = useState(null);
  const searchInputRef = React.useRef(null);

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);

  useEffect(() => {
    if (user?.id) {
      const fetchNotifications = async () => {
        const { response, err } = await userApi.getNotifications({ userId: user.id });
        if (response && response.data) {
          setNotifications(Array.isArray(response.data) ? response.data : []);
        } else {
          setNotifications([]);
        }
      };
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        const { response, err } = await searchApi.globalSearch({ query: searchQuery });
        if (response && response.data && response.data.results) {
          setSearchResults(response.data.results);
        } else {
          setSearchResults([]);
        }
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);
  const toggleMenu = (e) => setAnchorEl(e.currentTarget);
  const toggleMenu2 = (e) => setAnchorEl2(e.currentTarget);

  const [open, setOpen] = React.useState(false);

  const onSwithTheme = () => {
    const theme =
      themeMode === themeModes.dark ? themeModes.light : themeModes.dark;
    dispatch(setThemeMode(theme));
  };

  const handleDrawer = () => {
    setOpen((prev) => !prev);
  };

  // Close drawer on mobile when navigating
  const handleMobileClose = () => {
    if (isMobile) setOpen(false);
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
      <CustomAppBar sx={{ p: 0, m: 0 }} position="fixed" isMobile={isMobile}>
        <Box
          sx={{
            backgroundColor: "background.paper",
            height: "72px",
            display: "flex",
            px: { xs: 1, sm: 2 },
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Stack direction="row" sx={{ alignItems: "center" }} spacing={{ xs: 1, sm: 2 }}>
            <IconButton
              sx={{
                "&:hover": { color: "primary.main" },
                color: "primary.contrastText",
              }}
              onClick={handleDrawer}
            >
              <MenuIcon />
            </IconButton>
            <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", sm: "block" } }} />
            <Logo />
            {dashboardType === "Chat" ? (
              <Typography variant="h5" sx={{ fontWeight: "500", display: { xs: "none", sm: "block" } }}>
                | Chat
              </Typography>
            ) : dashboardType === "Platform" ? (
              <Typography variant="h5" sx={{ fontWeight: "500", display: { xs: "none", sm: "block" } }}>
                | Platform
              </Typography>
            ) : (
              <></>
            )}
          </Stack>
          {/* Search bar - hidden on mobile */}
          <ClickAwayListener onClickAway={() => setSearchAnchorEl(null)}>
            <Box sx={{ position: "relative", display: { xs: "none", md: "block" } }}>
              <Box
                ref={searchInputRef}
                sx={{
                  display: "flex",
                  border: 1,
                  borderColor: "primary.main",
                  pl: 1,
                  borderRadius: 100,
                  width: { md: "20vw", lg: "25vw" },
                  maxWidth: "400px",
                  alignItems: "center",
                  backgroundColor: "background.paper",
                }}
              >
                <InputBase
                  sx={{ ml: 1, flex: 1 }}
                  placeholder="Search Now..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!searchAnchorEl) setSearchAnchorEl(searchInputRef.current);
                  }}
                  onClick={(e) => {
                    if (searchQuery.length > 0) setSearchAnchorEl(e.currentTarget);
                  }}
                />
                <IconButton
                  sx={{
                    "&:hover": { color: "primary.main" },
                    color: "primary.contrastText",
                  }}
                >
                  {isSearching ? <CircularProgress size={20} /> : <SearchIcon />}
                </IconButton>
              </Box>

              <Popover
                open={Boolean(searchAnchorEl) && searchQuery.length > 0}
                anchorEl={searchAnchorEl}
                onClose={() => setSearchAnchorEl(null)}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                disableAutoFocus
                disableEnforceFocus
                sx={{ mt: 1 }}
                slotProps={{ paper: { sx: { width: searchInputRef.current?.offsetWidth || 300, maxHeight: 400 } } }}
              >
                <List dense>
                  {searchResults.length === 0 && !isSearching && (
                    <ListItem>
                      <ListItemText primary="No results found" />
                    </ListItem>
                  )}
                  {searchResults.map((result, idx) => (
                    <ListItemButton
                      key={idx}
                      component={Link}
                      to={result.url}
                      onClick={() => {
                        setSearchAnchorEl(null);
                        setSearchQuery("");
                      }}
                    >
                      <ListItemText
                        primary={result.title}
                        secondary={result.type === "topic" ? `Topic in ${result.lesson_title}` : "Lesson"}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Popover>
            </Box>
          </ClickAwayListener>
          <Stack direction="row" sx={{ alignItems: "center" }} spacing={{ xs: 0.5, sm: 1 }}>
            <Tooltip title="Notifications" arrow>
              <IconButton
                onClick={(e) => setNotifAnchorEl(e.currentTarget)}
                sx={{
                  "&:hover": { color: "primary.main" },
                  color: "primary.contrastText",
                }}
              >
                <Badge badgeContent={(notifications || []).length} color="error">
                  <NotificationsActiveIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Popover
              open={Boolean(notifAnchorEl)}
              anchorEl={notifAnchorEl}
              onClose={() => setNotifAnchorEl(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              sx={{ mt: 1 }}
              slotProps={{ paper: { sx: { width: 320, maxHeight: 400 } } }}
            >
              <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
                <Typography variant="h6">Notifications</Typography>
              </Box>
              <List sx={{ p: 0 }}>
                {(!notifications || notifications.length === 0) ? (
                  <ListItem sx={{ py: 3, justifyContent: "center" }}>
                    <Typography color="text.secondary">No new notifications</Typography>
                  </ListItem>
                ) : (
                  notifications.map((notif, idx) => (
                    <React.Fragment key={idx}>
                      <ListItem alignItems="flex-start" sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                        <ListItemText
                          primary={<Typography variant="subtitle2">{notif.title}</Typography>}
                          secondary={
                            <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {notif.content}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {idx < notifications.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                  ))
                )}
              </List>
            </Popover>
            <Tooltip title="Main Dashboard" arrow>
              <IconButton
                sx={{
                  "&:hover": { color: "primary.main" },
                  color: "primary.contrastText",
                  display: { xs: "none", sm: "flex" },
                }}
                href="/main"
              >
                <DashboardIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Theme Mode" arrow>
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
            </Tooltip>
            <Tooltip title="Settings" arrow>
              <IconButton
                href="/dashboard/settings"
                sx={{
                  "&:hover": { color: "primary.main" },
                  color: "primary.contrastText",
                  display: { xs: "none", sm: "flex" },
                }}
              >
                <SettingsOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </CustomAppBar>

      {/* Mobile: Temporary drawer (overlay) */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={open}
          onClose={handleMobileClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          <DrawerHeader sx={{ mt: 1 }}></DrawerHeader>
          <SidebarContent
            open={true}
            dashboardType={dashboardType}
            appState={appState}
            user={user}
            dispatch={dispatch}
            toggleMenu2={toggleMenu2}
            isMobile={isMobile}
            handleClose={handleMobileClose}
          />
        </Drawer>
      ) : (
        /* Desktop: Permanent mini-variant drawer */
        <CustomDrawer variant="permanent" open={open}>
          <DrawerHeader sx={{ mt: 1 }}></DrawerHeader>
          <SidebarContent
            open={open}
            dashboardType={dashboardType}
            appState={appState}
            user={user}
            dispatch={dispatch}
            toggleMenu2={toggleMenu2}
            isMobile={false}
            handleClose={() => { }}
          />
        </CustomDrawer>
      )}

      {/* User profile menu (shared) */}
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
          onClick={() => { setAnchorEl2(null); handleMobileClose(); }}
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
            primary={<Typography textTransform="uppercase">profile</Typography>}
          />
        </ListItemButton>
        <ListItemButton
          component={Link}
          to="/dashboard/updates"
          onClick={() => { setAnchorEl2(null); handleMobileClose(); }}
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
            primary={<Typography textTransform="uppercase">Updates</Typography>}
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
            primary={<Typography textTransform="uppercase">sign out</Typography>}
          />
        </ListItemButton>
      </Menu>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2, md: 3 } }}>
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
        px: { xs: 1, sm: 2 },
        borderColor: "primary.main",
        height: "72px",
        backgroundColor: "background.paper",
      }}
    >
      <Button
        sx={{
          backgroundColor: "graycolor.one",
          px: { xs: 2, sm: 3 },
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
      <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}>
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
        >
          {user?.username?.[0]}
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
