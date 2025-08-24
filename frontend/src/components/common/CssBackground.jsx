import React from "react";
import { Box } from "@mui/material";
import "./CssBackground.css"; // contains the CSS/animations

const CssBackground = ({ children }) => {
  return (
    <Box
      className="hero-bg"
      sx={{
        minHeight: "100vh", // full screen
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {children}
    </Box>
  );
};

export default CssBackground;
