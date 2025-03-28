import { Box } from '@mui/material'
import React, { useState } from 'react'
import { useSelector } from 'react-redux';
import { themeModes } from "../../configs/theme.config";


const CardSpotlight = ({children, sx}) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const { themeMode } = useSelector((state) => state.themeMode);

    
    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

  return (
    <Box elevation={8} onMouseMove={handleMouseMove} sx={{
        position: 'relative',
        overflow: 'hidden',
        color: 'white',
        width: '384px', 
        height: '384px',
        cursor: 'pointer',
        padding: '20px',
        border: 1,
        borderWidth:1,
        borderRadius:5,
        '&::before': {
            content: '""',
            position: 'absolute',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(129, 140, 248, 0.3) 0%, rgba(59, 130, 246, 0) 70%)',
            borderRadius: '50%',
            // top: '-200px',
            // left: '-200px',
            opacity: 0,
            transition: 'opacity 0.1s ease',
            pointerEvents: 'none',
            zIndex: 1,
            top: `${position.y - 200}px`,
            left: `${position.x - 200}px`,
        },
        '&:hover::before': {
            opacity: 1,
        },
        '&:hover': {
        
        },
        ...sx,
    }}>
        {children}
    </Box>
  )
}

export default CardSpotlight
