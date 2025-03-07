import React, { useEffect, useRef, useState } from 'react';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import { gsap } from 'gsap';
import { useSelector } from 'react-redux';

// Theme-aware cursor components
const InnerCursor = styled(Box)(({ $isDark }) => ({
  position: 'fixed',
  width: 5,
  height: 5,
  borderRadius: '50%',
  pointerEvents: 'none',
  zIndex: 11000,
  background: $isDark ? 'white' : 'black',
}));

const OuterCursor = styled(Box)(({ $isDark }) => ({
  position: 'fixed',
  width: 150,
  height: 150,
  borderRadius: '50%',
  pointerEvents: 'none',
  zIndex: 12000,
  border: `1px solid ${$isDark ? 'white' : 'black'}`,
  background: $isDark ? 'white' : 'black',
  boxShadow: `0 0 100px 100px ${$isDark ? 'white' : 'black'}`,
  opacity: 1,
  mixBlendMode: 'overlay',
}));

const GlowCursor = () => {
  // Get theme mode from Redux state
  const { themeMode } = useSelector((state) => state.themeMode);
  const isDark = themeMode === 'dark';
  
  const innerCursorRef = useRef(null);
  const outerCursorRef = useRef(null);
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      
      if (!isVisible) {
        setIsVisible(true);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    // Set the innerCursor directly on the cursor position
    gsap.set(innerCursorRef.current, {
      x: position.x,
      y: position.y,
    });

    // Animate the outerCursor with slight delay for that following effect
    gsap.to(outerCursorRef.current, {
      x: position.x - 50, // Center it (half of the 100px width)
      y: position.y - 50, // Center it (half of the 100px height)
      duration: 1,
      ease: "back.out(1.7)"
    });
  }, [position, isVisible]);

  return (
    <>
      <InnerCursor ref={innerCursorRef} $isDark={isDark} />
      <OuterCursor ref={outerCursorRef} $isDark={isDark} />
    </>
  );
};

export default GlowCursor;