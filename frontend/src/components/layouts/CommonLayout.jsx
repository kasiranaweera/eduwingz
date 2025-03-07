import React from 'react'
import Header from '../Header'
import Footer from '../Footer'
import { Box } from '@mui/material'
import { Outlet } from "react-router-dom";
import GlobalLoading from '../GlobalLoading'

const CommonLayout = () => {
  return (
    <>
      {/* pre loader */}
      <GlobalLoading />
      {/* pre loader */}

      <Box display="flex" minHeight="100vh">
        {/* header */}
        <Header />
        {/* header */}

        {/* main */}
        <Box
          component="main"
          flexGrow={1}
          overflow="hidden"
          minHeight="100vh"
        >
          <Outlet />
        </Box>
        {/* main */}
      </Box>

      {/* footer */}
      <Footer />
      {/* footer */}
    </>
  )
}

export default CommonLayout