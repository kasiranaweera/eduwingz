import React, { useEffect } from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import GlobalLoading from "../GlobalLoading";
import { useDispatch, useSelector } from "react-redux";
import userApi from "../../api/modules/user.api";
import { setUser } from "../../redux/features/userSlice";
import AuthModal from "../AuthModal";

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
        {/* main */}
        <Box component="main" flexGrow={1} overflow="hidden" minHeight="100vh">
          <Outlet />
        </Box>
        {/* main */}
      </Box>
    </>
  );
};

export default CommonLayout;
