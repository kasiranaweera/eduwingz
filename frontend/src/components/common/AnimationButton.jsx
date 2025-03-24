import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

const AnimatedButton = () => {
  const [animationState, setAnimationState] = useState('initial');
  const checkRef = useRef(null);
  
  const startAnimation = () => {
    if (animationState !== 'initial') return;
    setAnimationState('shrinking');
    
    // Animation sequence timing
    setTimeout(() => setAnimationState('progress'), 1300);
    setTimeout(() => setAnimationState('completing'), 3300);
    setTimeout(() => setAnimationState('success'), 4550);
    setTimeout(() => {
      if (checkRef.current) {
        checkRef.current.style.strokeDashoffset = 0;
      }
    }, 4600);
  };
  
  useEffect(() => {
    // Set up the SVG path for animation
    if (checkRef.current) {
      const length = checkRef.current.getTotalLength();
      checkRef.current.style.strokeDasharray = length;
      checkRef.current.style.strokeDashoffset = length;
    }
  }, []);
  
  return (
    <Box 
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
      }}
    >
      {/* Button */}
      <Box
        onClick={startAnimation}
        sx={{
          backgroundColor: '#2B2D2F',
          height: animationState === 'initial' ? '50px' : 
                 (animationState === 'shrinking' || animationState === 'progress') ? '10px' : 
                 animationState === 'completing' ? '10px' : '0px',
          width: animationState === 'initial' ? '200px' : 
                animationState === 'shrinking' ? '300px' : 
                animationState === 'progress' ? '300px' : '0px',
          borderRadius: animationState === 'initial' ? '4px' : '100px',
          position: 'absolute',
          cursor: animationState === 'initial' ? 'pointer' : 'default',
          transition: 'height 1300ms, width 1300ms, border-radius 1300ms',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {animationState === 'initial' && (
          <Typography 
            sx={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              fontSize: '1.25rem',
              color: '#71DFBE',
              position: 'absolute',
            }}
          >
            Submit
          </Typography>
        )}
      </Box>
      
      {/* Progress Bar */}
      <Box
        sx={{
          position: 'absolute',
          height: '10px',
          width: animationState === 'initial' || animationState === 'shrinking' ? '0px' :
                animationState === 'progress' ? '300px' : 
                animationState === 'completing' ? '0px' : 
                animationState === 'success' ? '80px' : '0px',
          borderRadius: animationState !== 'success' ? '200px' : '80px',
          backgroundColor: animationState !== 'success' ? '#444749' : '#71DFBE',
          transition: animationState === 'progress' ? 'width 2000ms linear' : 
                     'width 750ms, height 750ms, border-radius 750ms, background-color 750ms',
          height: animationState === 'success' ? '80px' : '10px',
          transform: 'translateX(-50%)',
          left: '50%',
        }}
      />
      
      {/* Checkmark */}
      <Box
        sx={{
          width: '30px',
          position: 'absolute',
          opacity: animationState === 'success' ? 1 : 0,
          transition: 'opacity 200ms',
          zIndex: 10,
        }}
      >
        <svg viewBox="0 0 25 30">
          <path
            ref={checkRef}
            className="check"
            d="M2,19.2C5.9,23.6,9.4,28,9.4,28L23,2"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Box>
    </Box>
  );
};

export default AnimatedButton;