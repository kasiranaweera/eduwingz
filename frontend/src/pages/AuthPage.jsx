import { Box, Button, IconButton, Modal, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAuthModalOpen } from "../redux/features/authModalSlice";
import { themeModes } from "../configs/theme.config";
import { Link } from "react-router-dom";
import { setThemeMode } from "../redux/features/themeModeSlice";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import SigninForm from "../components/SigninForm";
import SignupForm from "../components/SignupForm";
import ResetPasswordForm from "../components/ResetPasswordForm";
import ProfileSetup from "../components/ProfileSetup"
import GlowCursor from "../components/common/GlowCursor";
import Logo from "../components/common/Logo";

const actionState = {
  signin: "signin",
  signup: "signup",
  resetpassword: "resetpassword",
  profilesetup : "profilesetup",
};

const AuthPage = () => {
  const { authModalOpen } = useSelector((state) => state.authModal);
  const { themeMode } = useSelector((state) => state.themeMode);

  const dispatch = useDispatch();
  dispatch(setAuthModalOpen(true));

  const [action, setAction] = useState(actionState.signin);

  useEffect(() => {
    if (authModalOpen) setAction(actionState.signin);
  }, [authModalOpen]);

  const handleClose = () => dispatch(setAuthModalOpen(false));

  const switchAuthState = (state) => setAction(state);

  const height = window.innerHeight;

  const onSwithTheme = () => {
    const theme =
      themeMode === themeModes.dark ? themeModes.light : themeModes.dark;
    dispatch(setThemeMode(theme));
  };

  const specialDivRef = useRef(null);

  return (
    <Modal open={authModalOpen} onClose={handleClose}>
      <Box>
        <GlowCursor disableInRef={specialDivRef} />
      <Box
        sx={{
          "--dot-bg": themeMode === themeModes.dark ? "black" : "white",
          "--dot-color": "rgba(255, 143, 0, 0.5)",
          "--dot-size": "2px",
          "--dot-space": "30px",
          background: `linear-gradient(90deg, var(--dot-bg) calc(var(--dot-space) - var(--dot-size)), transparent 1%) center / var(--dot-space) var(--dot-space),
                       linear-gradient(var(--dot-bg) calc(var(--dot-space) - var(--dot-size)), transparent 1%) center / var(--dot-space) var(--dot-space),
                       var(--dot-color)`,
          height: window.innerHeight,
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flow",
            position: "static",
          }}
        >
          <Box
            ref={specialDivRef}
            sx={{
              display: "flex",
              direction: "row",
              justifyContent: "space-between",
              alignItems: "center",
              position: { md: "absolute", xs: "relative" },
              p: 3,
              left: "0%",
              width: { md: "100%", xs: "100%" },
            }}
          >
            <Button
              sx={{
                color: "inherit",
                borderColor: "inherit",
                "&:hover": {
                  backgroundColor: "inherit",
                  borderColor: "inherit",
                },
                width: "100px",
              }}
              variant="outlined"
              componet={Link}
              to='/home'
            >
              Home
            </Button>
            <Box>
              <Logo />
            </Box>
            <Box
              sx={{
                width: "100px",
                justifyContent: "right",
                display: "flex",
                direction: "row",
              }}
            >
              <IconButton
                sx={{ color: "inherit", mr: 1 }}
                onClick={onSwithTheme}
              >
                {themeMode === themeModes.light && <DarkModeOutlinedIcon />}
                {themeMode === themeModes.dark && <WbSunnyOutlinedIcon />}
              </IconButton>
            </Box>
          </Box>
          <Box
            sx={{
              justifyContent: "center",
              position: "static",
              display: "flex",
              height: height,
              alignItems: "center",
              paddingTop: 10,
            }}
          >
            <Box
              ref={specialDivRef}
              sx={{
                padding: 3,
                border: 1,
                width: "30vw",
                justifyItems: "center",
                borderRadius: 3,
                borderColor:
                  themeMode === themeModes.dark
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(0, 0, 0, 0.2)",
                position: "relative",
                display: "flow",
                backdropFilter: `blur(1px)`,
              }}
            >
              {action === actionState.signin && (
                <SigninForm
                  switchAuthState={() => switchAuthState(actionState.signup)}
                />
              )}
              {action === actionState.signup && (
                <SignupForm
                  switchAuthState={() => switchAuthState(actionState.signin)}
                  profileSetupState={() => switchAuthState(actionState.profilesetup)}
                  
                />
              )}
              {action === actionState.resetpassword && <ResetPasswordForm />}
              {action === actionState.profilesetup && <ProfileSetup switchAuthState={() => switchAuthState(actionState.signin)} />}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
    </Modal>
  );
};

export default AuthPage;
