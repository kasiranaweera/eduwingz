import React, { useEffect } from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import GlobalLoading from "../GlobalLoading";
import { useDispatch, useSelector } from "react-redux";
import userApi from "../../api/modules/user.api";
import { setUser } from "../../redux/features/userSlice";
import AuthModal from "../AuthModal";
import DrawerTopBar from "../DrawerTopBar";

const content = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Rhoncus dolor purus non enim praesent elementum facilisis leo vel. Risus at ultrices mi tempus imperdiet. Semper risus in hendrerit gravida rutrum quisque non tellus. Convallis convallis tellus id interdum velit laoreet id donec ultrices. Odio morbi quis commodo odio aenean sed adipiscing. Amet nisl suscipit adipiscing bibendum est ultricies integer quis. Cursus euismod quis viverra nibh cras. Metus vulputate eu scelerisque felis imperdiet proin fermentum leo. Mauris commodo quis imperdiet massa tincidunt. Cras tincidunt lobortis feugiat vivamus at augue. At augue eget arcu dictum varius duis at consectetur lorem. Velit sed ullamcorper morbi tincidunt. Lorem donec massa sapien faucibus et molestie ac."


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
