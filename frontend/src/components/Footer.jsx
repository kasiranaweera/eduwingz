import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import React, { use } from "react";
import Logo from "./common/Logo";
import menuConfigs from "../configs/menu.configs";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { themeModes } from "../configs/theme.config";

const Footer = () => {
  const themeMode = useSelector((state) => state.themeMode.themeMode);
  return (
    <Paper
      square={true}
      sx={{
        backgroundImage: "unset",
        padding: "2rem",
        width: "100%",
        boxShadow: 20,
      }}
    >
      <Stack
        alignItems="center"
        justifyContent={{xs: 'center', md:"space-between"}}
        direction={{ xs: "column", md: "row " }}
        sx={{ height: "max-content" }}
      >
        <Box justifyContent={{xs: 'center', md:"space-between"}}>
          {menuConfigs.footMenu.map((item, index) => (
            <Button
              key={index}
              sx={{ color: "primary.contrastText", mr:1, '&:hover':{color: 'primary.main'}, borderRadius:100 }}
              component={Link}
              to={item.path}
            >
              {item.display}
            </Button>
          ))}
        </Box>
        <Box>
          {menuConfigs.socialMedia.map((item) => (
            <IconButton aria-label={item.state} size="large" sx={{'&:hover':{color: 'primary.main'}}}>
              {item.icon}
            </IconButton>
          ))}
        </Box>
      </Stack>
      <Box sx={{ textAlign: "center" }}>
        <Typography
          sx={{
            color:
              themeMode === themeModes.dark ? "text.primary" : "text.primary",
            mt: 1,
            fontWeight: 500,
          }}
        >
          © 2025 | EduWingz | All Rights Reserved
        </Typography>
      </Box>
    </Paper>
  );
};

export default Footer;
