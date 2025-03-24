import React, { useEffect } from "react";
import { styled } from "@mui/system";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

// Particle animation logic
const RANDOM = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const PARTICLES = Array.from({ length: 20 }).map((_, i) => ({
  id: i,
  style: {
    "--x": RANDOM(20, 80),
    "--y": RANDOM(20, 80),
    "--duration": RANDOM(6, 20),
    "--delay": RANDOM(1, 10),
    "--alpha": RANDOM(40, 90) / 100,
    "--origin-x": Math.random() > 0.5 ? RANDOM(300, 800) * -1 : RANDOM(300, 800),
    "--origin-y": Math.random() > 0.5 ? RANDOM(300, 800) * -1 : RANDOM(300, 800),
    "--size": RANDOM(40, 90) / 100,
  },
}));

// Styled components
const SparkleButtonContainer = styled("div")({
  position: "relative",
});

const ParticlePen = styled("span")({
  position: "absolute",
  width: "200%",
  aspectRatio: "1",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  mask: "radial-gradient(white, transparent 65%)",
  zIndex: -1,
  opacity: "var(--active, 0)",
  transition: "opacity 0.25s",
});

const Particle = styled("svg")(({ style }) => ({
  fill: "white",
  width: "calc(var(--size, 0.25) * 1rem)",
  aspectRatio: "1",
  position: "absolute",
  top: "calc(var(--y) * 1%)",
  left: "calc(var(--x) * 1%)",
  opacity: "var(--alpha, 1)",
  animation: "float-out calc(var(--duration, 1) * 1s) calc(var(--delay) * -1s) infinite linear",
  transformOrigin: "var(--origin-x, 1000%) var(--origin-y, 1000%)",
  zIndex: -1,
  animationPlayState: "var(--play-state, paused)",
  "& path": {
    fill: "hsl(0 0% 90%)",
    stroke: "none",
  },
}));

const SparkButton = () => {
  return (
    <SparkleButtonContainer>
      <Button
        sx={{
          "--cut": "0.1em",
          "--active": 0,
          background:
            "radial-gradient(40% 50% at center 100%, hsl(270 calc(var(--active) * 97%) 72% / var(--active)), transparent), radial-gradient(80% 100% at center 120%, hsl(260 calc(var(--active) * 97%) 70% / var(--active)), transparent), hsl(260 calc(var(--active) * 97%) calc((var(--active) * 44%) + 12%))",
          fontSize: "2rem",
          fontWeight: 500,
          border: 0,
          cursor: "pointer",
          padding: "0.9em 1.3em",
          display: "flex",
          alignItems: "center",
          gap: "0.25em",
          whiteSpace: "nowrap",
          borderRadius: "100px",
          position: "relative",
          boxShadow:
            "0 0 calc(var(--active) * 6em) calc(var(--active) * 3em) hsl(260 97% 61% / 0.75), 0 0.05em 0 0 hsl(260 calc(var(--active) * 97%) calc((var(--active) * 50%) + 30%)) inset, 0 -0.05em 0 0 hsl(260 calc(var(--active) * 97%) calc(var(--active) * 60%)) inset",
          transition: "box-shadow 0.25s, scale 0.25s, background 0.25s",
          scale: "calc(1 + (var(--active) * 0.1))",
          "&:active": {
            scale: 1,
          },
          "&:hover, &:focus-visible": {
            "--active": 1,
            "--play-state": "running",
          },
        }}
      >
        <Box
          component="span"
          sx={{
            position: "absolute",
            inset: 0,
            borderRadius: "100px",
            rotate: "0deg",
            overflow: "hidden",
            mask: "linear-gradient(white, transparent 50%)",
            animation: "flip 3.6s infinite steps(2, end)",
            "&:before": {
              content: '""',
              position: "absolute",
              width: "200%",
              aspectRatio: "1",
              top: "0%",
              left: "50%",
              zIndex: -1,
              transform: "translate(-50%, -15%) rotate(-90deg)",
              opacity: "calc((var(--active)) + 0.4)",
              background:
                "conic-gradient(from 0deg, transparent 0 340deg, white 360deg)",
              transition: "opacity 0.25s",
              animation: "rotate 1.8s linear infinite both",
            },
            "&:after": {
              content: '""',
              position: "absolute",
              inset: "var(--cut)",
              borderRadius: "100px",
            },
          }}
        />
        <Box
          component="span"
          sx={{
            position: "absolute",
            inset: "var(--cut)",
            background:
              "radial-gradient(40% 50% at center 100%, hsl(270 calc(var(--active) * 97%) 72% / var(--active)), transparent), radial-gradient(80% 100% at center 120%, hsl(260 calc(var(--active) * 97%) 70% / var(--active)), transparent), hsl(260 calc(var(--active) * 97%) calc((var(--active) * 44%) + 12%))",
            borderRadius: "100px",
            transition: "background 0.25s",
          }}
        />
        <Box
          component="svg"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          sx={{
            overflow: "visible !important",
            inlineSize: "1.25em",
            transform: "translate(-25%, -5%)",
            "& path": {
              color: "hsl(0 0% calc((var(--active, 0) * 70%) + var(--base)))",
              transformBox: "fill-box",
              transformOrigin: "center",
              fill: "currentColor",
              stroke: "currentColor",
              animationDelay: "calc((0.25s * 1.5) + (var(--delay) * 1s))",
              animationDuration: "0.6s",
              transition: "color 0.25s",
            },
            "&:hover path, &:focus-visible path": {
              animationName: "bounce",
            },
          }}
        >
          <path
            d="M14.187 8.096L15 5.25L15.813 8.096C16.0231 8.83114 16.4171 9.50062 16.9577 10.0413C17.4984 10.5819 18.1679 10.9759 18.903 11.186L21.75 12L18.904 12.813C18.1689 13.0231 17.4994 13.4171 16.9587 13.9577C16.4181 14.4984 16.0241 15.1679 15.814 15.903L15 18.75L14.187 15.904C13.9769 15.1689 13.5829 14.4994 13.0423 13.9587C12.5016 13.4181 11.8321 13.0241 11.097 12.814L8.25 12L11.096 11.187C11.8311 10.9769 12.5006 10.5829 13.0413 10.0423C13.5819 9.50162 13.9759 8.83214 14.186 8.097L14.187 8.096Z"
            fill="black"
            stroke="black"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 14.25L5.741 15.285C5.59267 15.8785 5.28579 16.4206 4.85319 16.8532C4.42059 17.2858 3.87853 17.5927 3.285 17.741L2.25 18L3.285 18.259C3.87853 18.4073 4.42059 18.7142 4.85319 19.1468C5.28579 19.5794 5.59267 20.1215 5.741 20.715L6 21.75L6.259 20.715C6.40725 20.1216 6.71398 19.5796 7.14639 19.147C7.5788 18.7144 8.12065 18.4075 8.714 18.259L9.75 18L8.714 17.741C8.12065 17.5925 7.5788 17.2856 7.14639 16.853C6.71398 16.4204 6.40725 15.8784 6.259 15.285L6 14.25Z"
            fill="black"
            stroke="black"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.5 4L6.303 4.5915C6.24777 4.75718 6.15472 4.90774 6.03123 5.03123C5.90774 5.15472 5.75718 5.24777 5.5915 5.303L5 5.5L5.5915 5.697C5.75718 5.75223 5.90774 5.84528 6.03123 5.96877C6.15472 6.09226 6.24777 6.24282 6.303 6.4085L6.5 7L6.697 6.4085C6.75223 6.24282 6.84528 6.09226 6.96877 5.96877C7.09226 5.84528 7.24282 5.75223 7.4085 5.697L8 5.5L7.4085 5.303C7.24282 5.24777 7.09226 5.15472 6.96877 5.03123C6.84528 4.90774 6.75223 4.75718 6.697 4.5915L6.5 4Z"
            fill="black"
            stroke="black"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Box>
        <Box
          component="span"
          sx={{
            transform: "translate(2%, -6%)",
            letterSpacing: "0.01ch",
            background:
              "linear-gradient(90deg, hsl(0 0% calc((var(--active) * 100%) + 65%)), hsl(0 0% calc((var(--active) * 100%) + 26%)))",
            WebkitBackgroundClip: "text",
            color: "transparent",
            transition: "background 0.25s",
          }}
        >
          Generate Site
        </Box>
      </Button>
      <ParticlePen>
        {PARTICLES.map((particle) => (
          <Particle
            key={particle.id}
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={particle.style}
          >
            <path
              d="M6.937 3.846L7.75 1L8.563 3.846C8.77313 4.58114 9.1671 5.25062 9.70774 5.79126C10.2484 6.3319 10.9179 6.72587 11.653 6.936L14.5 7.75L11.654 8.563C10.9189 8.77313 10.2494 9.1671 9.70874 9.70774C9.1681 10.2484 8.77413 10.9179 8.564 11.653L7.75 14.5L6.937 11.654C6.72687 10.9189 6.3329 10.2494 5.79226 9.70874C5.25162 9.1681 4.58214 8.77413 3.847 8.564L1 7.75L3.846 6.937C4.58114 6.72687 5.25062 6.3329 5.79126 5.79226C6.3319 5.25162 6.72587 4.58214 6.936 3.847L6.937 3.846Z"
              fill="black"
              stroke="black"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Particle>
        ))}
      </ParticlePen>
    </SparkleButtonContainer>
  );
};

export default SparkButton;