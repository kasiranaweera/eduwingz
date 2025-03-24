import React, { useEffect, useRef, useState } from "react";
import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";
import { gsap } from "gsap";
import { useSelector } from "react-redux";

// Theme-aware cursor components
const InnerCursor = styled(Box)(({ $isDark }) => ({
  position: "fixed",
  width: 5,
  height: 5,
  borderRadius: "50%",
  pointerEvents: "none",
  zIndex: 11000,
  background: $isDark ? "white" : "black",
  visibility: "visible",
}));

const OuterCursor = styled(Box)(({ $isDark }) => ({
  position: "fixed",
  width: 150,
  height: 150,
  borderRadius: "50%",
  pointerEvents: "none",
  zIndex: 12000,
  border: `1px solid ${$isDark ? "white" : "black"}`,
  background: $isDark ? "white" : "black",
  boxShadow: `0 0 100px 100px ${$isDark ? "white" : "black"}`,
  opacity: 1,
  mixBlendMode: "overlay",
  visibility: "visible",
}));

const GlowCursor = ({ disableInRef }) => {
  // Get theme mode from Redux state
  const { themeMode } = useSelector((state) => state.themeMode);
  const isDark = themeMode === "dark";

  const innerCursorRef = useRef(null);
  const outerCursorRef = useRef(null);
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isVisible, setIsVisible] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDisabled) {
        setPosition({ x: e.clientX, y: e.clientY });
        if (!isVisible) {
          setIsVisible(true);
        }
      }
    };

    const handleMouseEnter = () => setIsDisabled(true);
    const handleMouseLeave = () => setIsDisabled(false);

    document.addEventListener("mousemove", handleMouseMove);

    if (disableInRef?.current) {
      disableInRef.current.addEventListener("mouseenter", handleMouseEnter);
      disableInRef.current.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      if (disableInRef?.current) {
        disableInRef.current.removeEventListener("mouseenter", handleMouseEnter);
        disableInRef.current.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [isVisible, isDisabled, disableInRef]);

  useEffect(() => {
    if (!isVisible || isDisabled) {
      gsap.set(innerCursorRef.current, { visibility: "hidden" });
      gsap.set(outerCursorRef.current, { visibility: "hidden" });
      return;
    }

    gsap.set(innerCursorRef.current, { visibility: "visible", x: position.x, y: position.y });

    gsap.to(outerCursorRef.current, {
      visibility: "visible",
      x: position.x - 75,
      y: position.y - 75,
      duration: 1,
      ease: "back.out(1.7)",
    });
  }, [position, isVisible, isDisabled]);

  return (
    <>
      <InnerCursor ref={innerCursorRef} $isDark={isDark} />
      <OuterCursor ref={outerCursorRef} $isDark={isDark} />
    </>
  );
};

export default GlowCursor;
