import { Box, Button, IconButton } from "@mui/material";
import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { themeModes } from "../configs/theme.config";
import { setThemeMode } from "../redux/features/themeModeSlice";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import ProfileSetup from "../components/ProfileSetup";
import GlowCursor from "../components/common/GlowCursor";
import Logo from "../components/common/Logo";
import PageWrapper from "../components/PageWrapper";

const ProfileSetupPage = () => {
  const { themeMode } = useSelector((state) => state.themeMode);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSwithTheme = () => {
    const theme =
      themeMode === themeModes.dark ? themeModes.light : themeModes.dark;
    dispatch(setThemeMode(theme));
  };

  const specialDivRef = useRef(null);

  const handleSkip = () => {
    navigate("/home");
  };

  return (
    <PageWrapper state="profilesetup">
      <Box
        sx={{
          "--dot-bg": themeMode === themeModes.dark ? "black" : "white",
          "--dot-color": "rgba(255, 143, 0, 0.3)",
          "--dot-size": "2px",
          "--dot-space": "30px",
          background: `linear-gradient(90deg, var(--dot-bg) calc(var(--dot-space) - var(--dot-size)), transparent 1%) center / var(--dot-space) var(--dot-space),
                       linear-gradient(var(--dot-bg) calc(var(--dot-space) - var(--dot-size)), transparent 1%) center / var(--dot-space) var(--dot-space),
                       var(--dot-color)`,
          height: height,
          minHeight: "100vh",
        }}
      >
        <GlowCursor disableInRef={specialDivRef} />
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          {/* Header */}
          <Box
            ref={specialDivRef}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              p: 3,
              width: "100%",
              zIndex: 10,
              backdropFilter: "blur(8px)",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
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
              onClick={() => navigate("/home")}
            >
              Home
            </Button>
            <Box>
              <Logo />
            </Box>
            <Box
              sx={{
                width: "100px",
                display: "flex",
                justifyContent: "flex-end",
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
          {/* Main Content */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              flex: 1,
              padding: "40px 20px",
              paddingTop: "80px",
              overflowY: "auto",
            }}
          >
            <Box
              ref={specialDivRef}
              sx={{
                padding: 4,
                border: 1,
                width: "100%",
                maxWidth: "600px",
                borderRadius: 3,
                borderColor:
                  themeMode === themeModes.dark
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(0, 0, 0, 0.2)",
                position: "relative",
                backdropFilter: `blur(1px)`,
              }}
            >
              <ProfileSetup onSkip={handleSkip} onSuccess={() => navigate("/home")} />
            </Box>
          </Box>
        </Box>
      </Box>
    </PageWrapper>
  );
};

export default ProfileSetupPage;
