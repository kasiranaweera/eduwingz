import React from 'react';
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import GlobalLoading from "../GlobalLoading";
import AuthPage from '../../pages/AuthPage';

const DashboardLayout = () => {

  return (
    <>
      {/* pre loader */}
      <GlobalLoading />
      {/* pre loader */}

      <Box minHeight="100vh" component="main" flexGrow={1} overflow="hidden">
        
          {/* main */}
          <AuthPage main_contect={<Outlet/>}/>
          {/* main */}

      </Box>
        
    </>
  );
};

export default DashboardLayout;