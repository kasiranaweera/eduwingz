import {
  Box,
  Container,
  Divider,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import ChatSection from "../components/ChatSection";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import { useSelector } from "react-redux";
import DashboardIcon from "@mui/icons-material/Dashboard";

const MainBoardPage = () => {
  const { user } = useSelector((state) => state.user);

  return (
    <Container
      sx={{
        alignItems: "center",
        display: "flex",
        justifyContent: "center",
        height: "80vh",
        width: "100%",
      }}
    >
      <Stack spacing={10}>
        <Typography
          variant="h3"
          sx={{ textAlign: "center", fontWeight: "500" }}
        >{`How's it going, ${user.username} ?`}</Typography>
        <Box sx={{width:'100%'}}>
          <Box sx={{ justifyContent: "center", display: "flex" }}>
            <ChatSection sx={{ width: "50vw" }} main='true'/>
          </Box>

          <Divider sx={{ my: 3, width:'75vw' }} />
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Link
              href="/dashboard/chat/new"
              underline="none"
              color="primary.contrastText"
            >
              <Box
                sx={{
                  backgroundColor: "background.paper",
                  display: "flex",
                  gap: 2,
                  width: "20vw",
                  p: 2,
                  borderRadius: 5,
                  borderBottom: 1,
                  borderLeft: 1,
                  borderColor: "primary.main",
                }}
              >
                <Box
                  sx={{
                    backgroundColor: "primary.contrastText",
                    p: 1,
                    alignItems: "center",
                    display: "flex",
                    borderRadius: 3,
                  }}
                >
                  <ChatOutlinedIcon
                    sx={{ color: "graycolor.one", mx: 1 }}
                    fontSize="large"
                  />
                </Box>
                <Box sx={{}}>
                  <Typography variant="h6" sx={{ fontWeight: "600" }}>
                    EduWingz - Chat
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: "300" }}>
                    Find answers tailored to your learning patterns with
                    intelligent chat system.
                  </Typography>
                </Box>
              </Box>
            </Link>
            <Link
              href="/dashboard/platform"
              underline="none"
              color="primary.contrastText"
            >
              <Box
                sx={{
                  backgroundColor: "background.paper",
                  display: "flex",
                  gap: 2,
                  width: "20vw",
                  p: 2,
                  borderRadius: 5,
                  borderBottom: 1,
                  borderLeft: 1,
                  borderColor: "primary.main",
                }}
              >
                <Box
                  sx={{
                    backgroundColor: "primary.contrastText",
                    p: 1,
                    alignItems: "center",
                    display: "flex",
                    borderRadius: 3,
                  }}
                >
                  <DashboardIcon
                    sx={{ color: "graycolor.one", mx: 1 }}
                    fontSize="large"
                  />
                </Box>
                <Box sx={{}}>
                  <Typography variant="h6" sx={{ fontWeight: "600" }}>
                    EduWingz - Platform
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: "300" }}>
                    Experience personalized education designed to fit your
                    learning journey.
                  </Typography>
                </Box>
              </Box>
            </Link>
          </Box>
        </Box>
      </Stack>
    </Container>
  );
};

export default MainBoardPage;
