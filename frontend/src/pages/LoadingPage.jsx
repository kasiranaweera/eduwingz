import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, IconButton, LinearProgress, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import mainlogo from "../assets/img/eduwingz_logo.png";
import blacklogo from "../assets/img/eduwingz_name_b.png";
import whitelogo from "../assets/img/eduwingz_name_w.png";
import { themeModes } from "../configs/theme.config";
import { setThemeMode } from "../redux/features/themeModeSlice";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import OrbElement from "../components/common/OrbElement";
import DecryptedText from "../components/common/DecryptedText";
import ShinyText from "../components/common/ShineText";

const LoadingPage = () => {
  const { themeMode } = useSelector((state) => state.themeMode);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const onSwithTheme = () => {
    const theme =
      themeMode === themeModes.dark ? themeModes.light : themeModes.dark;
    dispatch(setThemeMode(theme));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval); // Stop the interval when progress reaches 100%
          navigate('/home'); // Redirect to the home page
          return 100;
        }
        return prevProgress + 10; // Increment progress by 10%
      });
    }, 500); // Update progress every 300ms

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <Box
      sx={{
        textAlign: "center",
        backgroundColor:
          themeMode === "dark" ? "background.paper" : "background.paper",
        height: "100vh",
        display: "block",
        flexDirection: "column",
        justifyContent: "center",
        padding: 2,
      }}
    >
      <Box
        sx={{
          position: "relative",
          display: "flex",
          justifyContent: "end",
          width: "100wv",
        }}
      >
        <IconButton
          sx={{
            color:
              themeMode === themeModes.dark
                ? "primary.main"
                : "primary.contrastText",
          }}
          onClick={onSwithTheme}
        >
          {themeMode === themeModes.light && <DarkModeOutlinedIcon />}
          {themeMode === themeModes.dark && <WbSunnyOutlinedIcon />}
        </IconButton>
      </Box>
      <Box
        sx={{
          width: "100wv",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "90vh",
        }}
      >
        <Box>
          {" "}
          <img
            src={mainlogo}
            alt="logo"
            style={{ height: "200px", margin: "0 auto" }}
          />
        </Box>

        <Box sx={{ mt: 2 }}>
          <img
            src={themeMode === themeModes.dark ? whitelogo : blacklogo}
            alt="logo"
            style={{ height: "100px", margin: "0 auto" }}
          />
        </Box>
        {/* <Typography variant="h4" gutterBottom sx={{fontFamily:'Russo One', mt: 2}}> 
          A personalized virtual learning experience
        </Typography> */}
        <ShinyText variant="h4" sx={{fontFamily:'Russo One', mt: 2}}>A personalized virtual learning experience</ShinyText>
        <Box sx={{ width: "20%", margin: "0 auto", mt: 2 }}>
          <LinearProgress variant="buffer" value={progress} />
        </Box>
        {/* <OrbElement /> */}
      </Box>
    </Box>
  );
};

export default LoadingPage;
