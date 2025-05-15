import {
  Box,
  Container,
  Divider,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import ChatSection from "../components/ChatSection";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { useNavigate } from "react-router-dom";

const ChatNewPage = () => {
  // const { user } = useSelector((state) => state.user);
  const user = {username: "Kasi"}

  const navigate = useNavigate();

  const handleSendMessage = (messageText) => {
    navigate("/dashboard/chat", { state: { message: messageText } });
  };


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
        <Box sx={{ width: "100%" }}>
          <Box sx={{ justifyContent: "center", display: "flex" }}>
            <ChatSection handleSendMessage={handleSendMessage} sx={{ width: "50vw" }} />
          </Box>
        </Box>
      </Stack>
    </Container>
  );
};

export default ChatNewPage;
