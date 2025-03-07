import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText 
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { styled } from '@mui/material/styles';

// Create a styled Card component with spotlight effect
const SpotlightCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: theme.palette.grey[900],
  color: theme.palette.common.white,
  width: '384px', // 96 in tailwind is 384px
  height: '384px',
  cursor: 'pointer',
  padding: theme.spacing(3),
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(129, 140, 248, 0.3) 0%, rgba(59, 130, 246, 0) 70%)',
    borderRadius: '50%',
    top: '-200px',
    left: '-200px',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none',
    zIndex: 1,
  },
  '&:hover::before': {
    opacity: 1,
  }
}));

// Component to track mouse position for the spotlight effect
export function CardSpotlightMaterial() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <SpotlightCard 
      elevation={8}
      onMouseMove={handleMouseMove}
      sx={{
        '&::before': {
          top: `${position.y - 200}px`,
          left: `${position.x - 200}px`,
        }
      }}
    >
      <CardContent sx={{ position: 'relative', zIndex: 2, height: '100%', p: 0 }}>
        <Typography variant="h5" component="p" sx={{ fontWeight: 'bold', mb: 2 }}>
          Authentication steps
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ color: 'grey.300', mb: 2 }}>
          Follow these steps to secure your account:
        </Typography>
        
        <List sx={{ mt: 1, mb: 2 }}>
          <Step title="Enter your email address" />
          <Step title="Create a strong password" />
          <Step title="Set up two-factor authentication" />
          <Step title="Verify your identity" />
        </List>
        
        <Typography variant="body2" sx={{ color: 'grey.400', mt: 2 }}>
          Ensuring your account is properly secured helps protect your personal
          information and data.
        </Typography>
      </CardContent>
    </SpotlightCard>
  );
}

const Step = ({ title }) => {
  return (
    <ListItem disableGutters sx={{ py: 0.5 }}>
      <ListItemIcon sx={{ minWidth: 36 }}>
        <CheckCircleIcon color="primary" fontSize="small" />
      </ListItemIcon>
      <ListItemText 
        primary={title} 
        primaryTypographyProps={{ sx: { color: 'common.white' } }}
      />
    </ListItem>
  );
};

export default CardSpotlightMaterial;