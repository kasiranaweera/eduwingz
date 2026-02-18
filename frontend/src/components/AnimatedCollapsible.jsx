import React, { useState, useEffect, useRef } from "react";
import { Box, IconButton } from "@mui/material";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import ChatSection from "./ChatSection";

const AnimatedCollapsible = ({ handleSendMessage }) => {
  const [open, setOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // ===== Scroll to bottom only when opened =====
  useEffect(() => {
    if (open && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [open]);

  return (
    <>
      {open ? (<Box
          ref={scrollContainerRef}
          sx={{
            position: "sticky",
            bottom: 0,
            width: "100%",
            maxHeight: "400px", // height for scroll area
            overflowY: "auto",
            bgcolor: "background.paper",
            borderRadius: "12px 12px 0 0",
          }}
        >
          <ChatSection handleSendMessage={handleSendMessage} />
          <div ref={messagesEndRef} />
        </Box>) : (
        <Box
          sx={{
            width: "100%",
            height: "50px",
            display: "flex",
            position: "sticky",
            bottom: 0,
            bgcolor: "graycolor.main",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.3s ease",
            "&:hover": {
              bgcolor: "graycolor.one",
              transform: "translateY(-2px)",
              boxShadow: 3,
            },
            borderRadius: "12px",
          }}
          onClick={() => setOpen((prev) => !prev)}
        >
          <IconButton
            sx={{
              color: "white",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease",
            }}
          >
            {open ? (
              <KeyboardDoubleArrowDownIcon />
            ) : (
              <KeyboardDoubleArrowUpIcon />
            )}
          </IconButton>
        </Box>
      )}
    </>
  );
};

export default AnimatedCollapsible;
