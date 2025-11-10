// src/components/FloatingPageUpButton.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Fab, Zoom, useScrollTrigger } from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

const FloatingPageUpButton = () => {
  const [showButton, setShowButton] = useState(true);

  

  useEffect(() => {
    const handleScroll = () => {
      const scrolledFromBottom =
        document.documentElement.scrollHeight -
        (window.innerHeight + window.scrollY);
      setShowButton(scrolledFromBottom > 300); // show when more than 300px from bottom
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBottom = useCallback(() => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  return (
    <Zoom in={showButton}>
      <Fab
        size="small"
        aria-label="scroll to bottom"
        onClick={scrollToBottom}
        sx={{
          position: "sticky",
          zIndex: 1400,
          bgcolor: "transparent",
          color: "primary.contrastText",
          "&:hover": {
            bgcolor: "graycolor.two",
          },
        }}
      >
        <ArrowDownwardIcon />
      </Fab>
    </Zoom>
  );
};

export default FloatingPageUpButton;
