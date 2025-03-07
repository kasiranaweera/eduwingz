import React from 'react';
import { Box, styled } from '@mui/material';

// Create a styled component with the inverted radius effect
const InvertedRadius = styled(Box)(({ 
  theme, 
  radius = '20px',
  size = '30px',
  offsetX = '20px',
  offsetY = '10px',
  bgColor = '#3FB8AF',
  width = '250px'
}) => {
  // Calculate derived values
  const doubleRadius = `calc(2 * ${radius})`;
  const sizeWithRadius = `calc(${size} + ${radius})`;
  const negRadius = `calc(-1 * ${radius})`;
  const negSizeWithRadius = `calc(-1 * (${size} + ${radius}))`;
  
  return {
    width: width,
    aspectRatio: '1',
    backgroundColor: bgColor,
    borderRadius: radius,
    
    // Complex mask properties split for clarity
    maskImage: `
      radial-gradient(circle 70% at calc(100% - ${radius} - ${offsetX}) 100%, #000 70%, #0000 72%),
      radial-gradient(circle 70% at 100% calc(100% - ${radius} - ${offsetY}), #000 70%, #0000 72%),
      radial-gradient(${size} at calc(100% - ${offsetX}) calc(100% - ${offsetY}), #0000 99%, #000 calc(100% + 1px)),
      conic-gradient(from 90deg at calc(100% - ${radius}) calc(100% - ${radius}), #0000 25%, #000 0)
    `,
    maskPosition: `
      calc(100% - ${sizeWithRadius} - ${offsetX}) 100%,
      100% calc(100% - ${sizeWithRadius} - ${offsetY}),
      ${negRadius} ${negRadius},
      ${negSizeWithRadius} 0,
      0 ${negSizeWithRadius}
    `,
    maskSize: `
      ${doubleRadius} ${doubleRadius},
      ${doubleRadius} ${doubleRadius},
      auto,
      auto,
      auto
    `,
    maskRepeat: 'no-repeat',

    // Add browser prefixes for better compatibility
    WebkitMaskImage: `
      radial-gradient(circle 70% at calc(100% - ${radius} - ${offsetX}) 100%, #000 70%, #0000 72%),
      radial-gradient(circle 70% at 100% calc(100% - ${radius} - ${offsetY}), #000 70%, #0000 72%),
      radial-gradient(${size} at calc(100% - ${offsetX}) calc(100% - ${offsetY}), #0000 99%, #000 calc(100% + 1px)),
      conic-gradient(from 90deg at calc(100% - ${radius}) calc(100% - ${radius}), #0000 25%, #000 0)
    `,
    WebkitMaskPosition: `
      calc(100% - ${sizeWithRadius} - ${offsetX}) 100%,
      100% calc(100% - ${sizeWithRadius} - ${offsetY}),
      ${negRadius} ${negRadius},
      ${negSizeWithRadius} 0,
      0 ${negSizeWithRadius}
    `,
    WebkitMaskSize: `
      ${doubleRadius} ${doubleRadius},
      ${doubleRadius} ${doubleRadius},
      auto,
      auto,
      auto
    `,
    WebkitMaskRepeat: 'no-repeat',
  };
});

// Component with customizable props
const InvertedRadiusComponent = ({
  radius = '20px',
  size = '30px',
  offsetX = '20px',
  offsetY = '10px',
  bgColor = '#3FB8AF',
  width = '250px',
  ...otherProps
}) => {
  return (
    <InvertedRadius
      radius={radius}
      size={size}
      offsetX={offsetX}
      offsetY={offsetY}
      bgColor={bgColor}
      width={width}
      {...otherProps}
    />
  );
};

export default InvertedRadiusComponent;