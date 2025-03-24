import React from "react";
import { Box, Typography } from "@mui/material";
import img from '../assets/img/asdasdadadada.jpg'

const HomePage = () => {
  return (
    <Box>
      <Box>
        <img src={img} alt="random" style={{ filter: 'grayscale(1)', opacity: 0.1}}/>
      </Box>
    </Box>
  );
};

export default HomePage;
