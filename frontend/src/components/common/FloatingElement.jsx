import React from "react";
import { Chip } from "@mui/material";
import { keyframes } from "@mui/system";
import { useSelector } from "react-redux";

// Bounce animation
const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

const FloatingElement = ({label}) => {
  // Get themeMode from Redux store
  const themeMode = useSelector((state) => state.themeMode);
  const isDark = themeMode === "dark";

  return (
    <Chip
      label={label}
      variant="outlined"
      sx={{
        borderRadius: 100,
        fontWeight: 500,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: isDark ? "primary.main" : "primary.main",
        animation: `${bounce} 1s infinite`,
        transition: "all 0.5s ease-in-out",
        py:1,
        px:2
      }}
    />
  );
};

export default FloatingElement;
