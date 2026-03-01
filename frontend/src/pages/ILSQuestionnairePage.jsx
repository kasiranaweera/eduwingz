import { Box, Button, IconButton } from "@mui/material";
import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { themeModes } from "../configs/theme.config";
import { setThemeMode } from "../redux/features/themeModeSlice";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import ILSQuestionnaire from "../components/ILSQuestionnaire";
import GlowCursor from "../components/common/GlowCursor";
import Logo from "../components/common/Logo";
import PageWrapper from "../components/PageWrapper";

const ILSQuestionnairePage = () => {
    const { themeMode } = useSelector((state) => state.themeMode);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const onSwithTheme = () => {
        const theme = themeMode === themeModes.dark ? themeModes.light : themeModes.dark;
        dispatch(setThemeMode(theme));
    };

    const specialDivRef = useRef(null);

    return (
        <PageWrapper state="ilsquestionnaire">
            <Box
                sx={{
                    "--dot-bg": themeMode === themeModes.dark ? "#0f0f0f" : "#fdfdfd",
                    "--dot-color": themeMode === themeModes.dark ? "rgba(255, 143, 0, 0.15)" : "rgba(255, 143, 0, 0.2)",
                    "--dot-size": "2px",
                    "--dot-space": "40px",
                    background: `linear-gradient(90deg, var(--dot-bg) calc(var(--dot-space) - var(--dot-size)), transparent 1%) center / var(--dot-space) var(--dot-space),
                       linear-gradient(var(--dot-bg) calc(var(--dot-space) - var(--dot-size)), transparent 1%) center / var(--dot-space) var(--dot-space),
                       var(--dot-color)`,
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column"
                }}
            >
                <GlowCursor disableInRef={specialDivRef} />

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
                        p: { xs: 2, md: 3 },
                        width: "100%",
                        zIndex: 10,
                        backdropFilter: "blur(12px)",
                        borderBottom: "1px solid",
                        borderColor: themeMode === themeModes.dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                    }}
                >
                    <Button
                        sx={{
                            color: "inherit",
                            borderColor: themeMode === themeModes.dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
                            "&:hover": {
                                backgroundColor: themeMode === themeModes.dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                            },
                            width: "100px",
                        }}
                        variant="outlined"
                        onClick={() => navigate("/profile-setup")}
                    >
                        Back
                    </Button>
                    <Box>
                        <Logo />
                    </Box>
                    <Box sx={{ width: "100px", display: "flex", justifyContent: "flex-end" }}>
                        <IconButton sx={{ color: "inherit" }} onClick={onSwithTheme}>
                            {themeMode === themeModes.light ? <DarkModeOutlinedIcon /> : <WbSunnyOutlinedIcon />}
                        </IconButton>
                    </Box>
                </Box>

                {/* Main Content Area */}
                <Box
                    sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        pt: "80px", // space for fixed header
                        pb: 4,
                        px: 2
                    }}
                >
                    <ILSQuestionnaire />
                </Box>
            </Box>
        </PageWrapper>
    );
};

export default ILSQuestionnairePage;
