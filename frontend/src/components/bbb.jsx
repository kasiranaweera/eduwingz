import React from 'react';
import { Box, styled } from '@mui/material';

// Main container styling (equivalent to body in your CSS)
const Container = styled(Box)({
  backgroundColor: '#F7F0D0',
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

// Inverted border radius component
const InvertedBorderRadius = styled(Box)(({ 
  bgColor = '#F66969',
  height = '100px',
  width = '325px',
  borderRadius = '25px 25px 25px 0',
  curveSize = '25px'
}) => {
  return {
    position: 'relative',
    height: height,
    width: width,
    backgroundColor: bgColor,
    borderRadius: borderRadius,
    
    '&::before': {
      content: '""',
      position: 'absolute',
      backgroundColor: 'transparent',
      bottom: `-${curveSize * 2}px`,
      height: `${curveSize * 2}px`,
      width: curveSize,
      borderTopLeftRadius: curveSize,
      boxShadow: `0 -${curveSize}px 0 0 ${bgColor}`,
    }
  };
});

// Combined component
const InvertedBorderRadiusComponent = ({
  bgColor = '#F66969',
  height = '100px',
  width = '325px',
  containerBgColor = '#F7F0D0',
  ...otherProps
}) => {
  return (
    <Container sx={{ backgroundColor: containerBgColor }}>
      <InvertedBorderRadius
        bgColor={bgColor}
        height={height}
        width={width}
        {...otherProps}
      />
    </Container>
  );
};

// Standalone component without container
const StandaloneInvertedBorderRadius = ({
  bgColor = '#F66969',
  height = '100px',
  width = '325px',
  borderRadius = '25px 25px 25px 0',
  curveSize = '25px',
  ...otherProps
}) => {
  return (
    <InvertedBorderRadius
      bgColor={bgColor}
      height={height}
      width={width}
      borderRadius={borderRadius}
      curveSize={curveSize}
      {...otherProps}
    />
  );
};

export { InvertedBorderRadiusComponent, StandaloneInvertedBorderRadius };