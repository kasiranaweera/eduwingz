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
import chatApi from "../api/modules/chat.api";

const ChatNewPage = () => {
  const { user } = useSelector((state) => state.user);
  // const user = {username: "Kasi"}

  const navigate = useNavigate();

  const handleSendMessage = (messageText) => {
    // Create a new chat session on the backend, post initial message, then open session page
    (async () => {
      try {
        const title = messageText ? messageText.slice(0, 80) : 'New Chat';
  const { response: session, err: sessionErr } = await chatApi.createSession({ title });
        if (sessionErr) {
          console.error('create session error', sessionErr);
          // fallback: navigate to chat list
          navigate('/dashboard/chat');
          return;
        }

        const sessionId = session?.id || session?.session_id || session?.uuid || session?.pk || session?.id;
        // Try to send the first message if we have a session id and a message
        if (sessionId && messageText) {
          const { err: msgErr } = await chatApi.postMessage(sessionId, { content: messageText });
          if (msgErr) console.error('post initial message error', msgErr);
        }

        // Navigate to session page
        if (sessionId) navigate(`/dashboard/chat/${sessionId}`);
        else navigate('/dashboard/chat');

      } catch (e) {
        console.error(e);
        navigate('/dashboard/chat');
      }
    })();
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
