"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";

// Wrapper styled with MUI
const SvgWrapper = styled("svg")(() => ({
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  pointerEvents: "none",
}));

export function DotPattern({
  width = 32,
  height = 32,
  x = 0,
  y = 0,
  cx = 1,
  cy = 1,
  cr = 3,
  glow = true,
  sx,
  ...props
}) {
  const id = useId();
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const dots = Array.from(
    {
      length:
        Math.ceil(dimensions.width / width) *
        Math.ceil(dimensions.height / height),
    },
    (_, i) => {
      const col = i % Math.ceil(dimensions.width / width);
      const row = Math.floor(i / Math.ceil(dimensions.width / width));
      return {
        x: col * width + cx,
        y: row * height + cy,
        delay: Math.random() * 5,
        duration: Math.random() * 3 + 2,
      };
    }
  );

  return (
    <SvgWrapper ref={containerRef} aria-hidden="true" sx={sx} {...props}>
      <defs>
        <radialGradient id={`${id}-gradient`}>
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      {dots.map((dot) => (
        <motion.circle
          key={`${dot.x}-${dot.y}`}
          cx={dot.x}
          cy={dot.y}
          r={cr}
          fill={glow ? `url(#${id}-gradient)` : "currentColor"}
          style={{ color: "rgba(160,160,160,0.8)" }} // similar to text-neutral-400/80
          initial={glow ? { opacity: 0.4, scale: 1 } : {}}
          animate={
            glow
              ? { opacity: [0.4, 1, 0.4], scale: [1, 1.5, 1] }
              : {}
          }
          transition={
            glow
              ? {
                  duration: dot.duration,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: dot.delay,
                  ease: "easeInOut",
                }
              : {}
          }
        />
      ))}
    </SvgWrapper>
  );
}
