import React from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import GlobalLoading from "../GlobalLoading";
import AuthModal from "../AuthModal";
import DrawerTopBar from "../DrawerTopBar";

const CommonLayout = () => {
  return (
    <>
      {/* pre loader */}
      <GlobalLoading />
      {/* pre loader */}

      {/* login modal */}
      <AuthModal />
      {/* login modal */}

      <Box display="inline" minHeight="100vh">
        {/* header */}
        <DrawerTopBar special={"true"} content={<Outlet />}/>
        {/* header */}

        {/* main */}
        {/* <Box component="main" flexGrow={1} overflow="hidden" minHeight="100vh">
          
        </Box> */}
        {/* main */}
      </Box>
    </>
  );
};

export default CommonLayout;
