import React from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import GlobalLoading from "../GlobalLoading";
import AuthPage from "../../pages/AuthPage";
import DrawerTopBar from "../DrawerTopBar";
import AuthModal from "../AuthModal";

const EmptyLayout = () => {
  return (
    <>
      {/* pre loader */}
      <GlobalLoading />
      {/* pre loader */}

      {/* login modal */}
      <AuthModal />
      {/* login modal */}

      <Box minHeight="100vh" component="main" flexGrow={1} overflow="hidden">
        {/* Header */}
        <DrawerTopBar />
        {/* main */}
        <Box>
          <Outlet />
        </Box>
        {/* main */}
      </Box>
    </>
  );
};

export default EmptyLayout;
