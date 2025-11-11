import React from "react";
import { Typography } from "@mui/material";
import { themeModes } from "../../configs/theme.config";
import { useSelector } from "react-redux";

const ShinyText = ({ children, disabled = false, sx, variant }) => {
  const { themeMode } = useSelector((state) => state.themeMode);

  return (
    <Typography
      sx={{
        color: themeMode === themeModes.dark ? "#f5f5f590" : "#12121290", // Adjust this color to change intensity/style
        background: disabled
          ? "none" // Disable the shiny effect
          : `linear-gradient(
              120deg,
              ${themeMode === themeModes.dark ? "#000" : "#ffffff"} 40%,
              ${themeMode === themeModes.dark ? "#FFF3E0" : "#FF8800"}  50%,
              ${themeMode === themeModes.dark ? "#000" : "#ffffff"} 60%
            )`,
        backgroundSize: "200% 100%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        display: "inline-block",
        animation: disabled ? "none" : "shine 5s linear infinite",
        "@keyframes shine": {
          "0%": {
            backgroundPosition: "100%",
          },
          "100%": {
            backgroundPosition: "-100%",
          },
        },
        ...sx,
      }}
      variant={variant}
    >
      {children}
    </Typography>
  );
};

export default ShinyText;
