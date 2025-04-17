import { Box, Button, IconButton, Modal } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAuthModalOpen } from "../redux/features/authModalSlice";
import Logo from "./common/Logo";
import SigninForm from "./SigninForm";
import SignupForm from "./SignupForm";
import { themeModes } from "../configs/theme.config";
import { Link } from "react-router-dom";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import { setThemeMode } from "../redux/features/themeModeSlice";
import GlowCursor from "./common/GlowCursor";
import ResetPasswordForm from "./ResetPasswordForm";

const actionState = {
  signin: "signin",
  signup: "signup",
  resetpassword: "resetpassword",
};

const AuthModal = () => {
  const { authModalOpen } = useSelector((state) => state.authModal);
  const { themeMode } = useSelector((state) => state.themeMode);

  const dispatch = useDispatch();

  const [action, setAction] = useState(actionState.signin);

  useEffect(() => {
    if (authModalOpen) setAction(actionState.signin);
  }, [authModalOpen]);

  const handleClose = () => dispatch(setAuthModalOpen(false));

  const switchAuthState = (state) => setAction(state);

  const onSwithTheme = () => {
    const theme =
      themeMode === themeModes.dark ? themeModes.light : themeModes.dark;
    dispatch(setThemeMode(theme));
  };

  const specialDivRef = useRef(null);

  const height = window.innerHeight;

  return (
    <Modal
      open={authModalOpen}
      onClose={handleClose}
      hideBackdrop
      sx={{
        "--dot-bg": themeMode === themeModes.dark ? "#121212" : "#fafafa",
        "--dot-color": "rgba(255, 143, 0, 0.3)",
        "--dot-size": "2px",
        "--dot-space": "30px",
        background: `linear-gradient(90deg, var(--dot-bg) calc(var(--dot-space) - var(--dot-size)), transparent 1%) center / var(--dot-space) var(--dot-space),
                           linear-gradient(var(--dot-bg) calc(var(--dot-space) - var(--dot-size)), transparent 1%) center / var(--dot-space) var(--dot-space),
                           var(--dot-color)`,
        height: window.innerHeight,
      }}
    >
      <Box>
        <GlowCursor disableInRef={specialDivRef} />
        <Box>
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
              height: height / 10,
              background: `linear-gradient(180deg, ${
                themeMode === themeModes.dark
                  ? "rgba(0,0,0,1)"
                  : "rgba(0,0,0,1)"
              }, ${
                themeMode === themeModes.dark
                  ? "rgba(0,0,0,0)"
                  : "rgba(0,0,0,0)"
              }`,
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
              onClick={handleClose}
            >
              Home
            </Button>
            <Box ref={specialDivRef}>
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
        </Box>
        <Box
          sx={{
            justifyContent: "center",
            position: "static",
            display: "flex",
            height: height,
            alignItems: "center",
            paddingTop: 5,
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
              backdropFilter: `blur(2 px)`,
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
              />
            )}
            {action === actionState.resetpassword && <ResetPasswordForm />}
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default AuthModal;
