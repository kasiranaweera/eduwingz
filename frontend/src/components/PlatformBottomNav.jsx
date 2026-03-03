import React from "react";
import { Box, Tooltip, IconButton, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import menuConfigs from "../configs/menu.configs";
import uiConfigs from "../configs/ui.config";

const PlatformBottomNav = ({ onMenuClick, activePanel }) => {
    const { appState } = useSelector((state) => state.appState);
    const navigate = useNavigate();

    const handleMenuClick = (index, path) => {
        if (index === 0) {
            navigate(path);
        } else {
            if (onMenuClick) onMenuClick(index);
        }
    };

    return (
        <Box
            sx={{
                position: "fixed",
                bottom: 20,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 1300,
            }}
        >
            <Box
                sx={{
                    backgroundColor: "background.paper",
                    px: 1.5,
                    py: 1,
                    borderRadius: 4,
                    gap: 0.5,
                    display: "inline-flex",
                    alignItems: "flex-end",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                    border: "1px solid",
                    borderColor: "divider",
                }}
            >
                {menuConfigs.platformMenu.map((item, index) => {
                    const isActive = activePanel === index;
                    return (
                        <Tooltip key={index} title={item.display} placement="top" arrow>
                            <Box
                                onClick={() => handleMenuClick(index, item.path)}
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    cursor: "pointer",
                                    px: 1.5,
                                    py: 0.75,
                                    borderRadius: 3,
                                    transition: "all 0.25s ease",
                                    background: isActive
                                        ? uiConfigs.style.mainGradient.color
                                        : "transparent",
                                    boxShadow: isActive
                                        ? "0 0 14px rgba(99,102,241,0.45)"
                                        : "none",
                                    "&:hover": {
                                        background: isActive
                                            ? uiConfigs.style.mainGradient.color
                                            : "action.hover",
                                        transform: "translateY(-3px)",
                                    },
                                }}
                            >
                                <IconButton
                                    size="medium"
                                    disableRipple
                                    sx={{
                                        p: 0,
                                        color: isActive
                                            ? "#fff"
                                            : "text.secondary",
                                        "&:hover": { color: isActive ? "#fff" : "primary.main" },
                                    }}
                                >
                                    {item.icon}
                                </IconButton>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontSize: "0.62rem",
                                        fontWeight: isActive ? 700 : 400,
                                        color: isActive ? "#fff" : "text.secondary",
                                        mt: 0.25,
                                        lineHeight: 1,
                                        letterSpacing: 0.3,
                                        userSelect: "none",
                                    }}
                                >
                                    {item.display}
                                </Typography>
                            </Box>
                        </Tooltip>
                    );
                })}
            </Box>
        </Box>
    );
};

export default PlatformBottomNav;
