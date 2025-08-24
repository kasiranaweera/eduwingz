// Ripple.jsx
import React, { memo } from "react";
import { Box, styled } from "@mui/material";

const RippleWrapper = styled(Box)(() => ({
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  userSelect: "none",
  maskImage: "linear-gradient(to bottom, white, transparent)",
}));

const RippleCircle = styled(Box)(() => ({
  position: "absolute",
  borderRadius: "50%",
  borderStyle: "solid",
  borderWidth: "1px",
  boxShadow: "0 0 20px rgba(0,0,0,0.2)",
  animation: "ripple var(--duration, 2s) ease infinite",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%) scale(1)",
  background: "rgba(255,255,255,0.25)", // mimic bg-foreground/25
  borderColor: "rgba(255,255,255,0.6)",
  "@keyframes ripple": {
    "0%, 100%": {
      transform: "translate(-50%, -50%) scale(1)",
    },
    "50%": {
      transform: "translate(-50%, -50%) scale(0.9)",
    },
  },
}));

export const Ripple = memo(function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 8,
}) {
  return (
    <RippleWrapper>
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 70;
        const opacity = mainCircleOpacity - i * 0.03;
        const animationDelay = `${i * 0.06}s`;

        return (
          <RippleCircle
            key={i}
            sx={{
              width: size,
              height: size,
              opacity,
              animationDelay,
            }}
          />
        );
      })}
    </RippleWrapper>
  );
});
