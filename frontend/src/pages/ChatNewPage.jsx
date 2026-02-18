import {
  Box,
  Container,
  Stack,
  Typography,
  List,
  ListItem,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import ChatSection from "../components/ChatSection";
import { useNavigate } from "react-router-dom";
import chatApi from "../api/modules/chat.api";
import ShinyText from "../components/common/ShinyText";
import TextType from "../components/common/TextType";

const ChatNewPage = () => {
  const { user } = useSelector((state) => state.user);
  // const user = {username: "Kasi"}

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const loadingMessages = [
    "Thinking...",
    "Searching knowledge base...",
    "Summarizing your data...",
    "Analyzing your document...",
    "AI is thinking...",
    "Processing your request...",
    "Gathering information...",
  ];

  // Loading message rotation
  useEffect(() => {
    if (!isLoading) {
      setLoadingMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoading, loadingMessages.length]);

  const handleSendMessage = async (messageText, attachments = []) => {
    const trimmed = messageText?.trim();
    if (!trimmed) return false;

    setIsLoading(true);
    
    // Create a new chat session on the backend, post initial message, then open session page
    try {
      const title = trimmed ? trimmed.slice(0, 80) : 'New Chat';
      const { response: session, err: sessionErr } = await chatApi.createSession({ title });
      if (sessionErr) {
        console.error('create session error', sessionErr);
        // fallback: navigate to chat list
        navigate('/dashboard/chat');
        setIsLoading(false);
        return false;
      }

      const sessionId = session?.id || session?.session_id || session?.uuid || session?.pk || session?.id;
      
      if (!sessionId) {
        console.error('No session ID received');
        navigate('/dashboard/chat');
        setIsLoading(false);
        return false;
      }

      // Upload files if any
      let documentIds = [];
      if (attachments.length > 0) {
        console.log(`Uploading ${attachments.length} file(s)...`);
        const uploadedDocuments = [];
        for (const file of attachments) {
          console.log(`Uploading file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
          const { response: uploadResponse, err: uploadErr } = await chatApi.uploadDocument(sessionId, file);
          if (uploadErr) {
            console.error("upload document error", uploadErr);
            // Continue with message even if file upload fails
            continue;
          }
          if (uploadResponse) {
            console.log("Upload successful:", uploadResponse);
            uploadedDocuments.push(uploadResponse);
          } else {
            console.warn("Upload response is empty for file:", file.name);
          }
        }
        documentIds = uploadedDocuments
          .map((doc) => doc?.id)
          .filter(Boolean);
        console.log(`Successfully uploaded ${documentIds.length} document(s). IDs:`, documentIds);
      }

      // Try to send the first message if we have a session id and a message
      if (sessionId && trimmed) {
        const { err: msgErr } = await chatApi.postMessage(sessionId, { 
          content: trimmed,
          document_ids: documentIds,
        });
        if (msgErr) {
          console.error('post initial message error', msgErr);
          setIsLoading(false);
          return false;
        }
      }

      // Navigate to session page
      navigate(`/dashboard/chat/${sessionId}`);
      setIsLoading(false);
      return true;

    } catch (e) {
      console.error(e);
      setIsLoading(false);
      navigate('/dashboard/chat');
      return false;
    }
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
          {isLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <List sx={{ width: "50vw" }}>
                <ListItem sx={{ justifyContent: "center", alignItems: "center", gap: 2 }}>
                  <ShinyText variant="body2" sx={{ ml: 1 }}>
                    <TextType
                      text={loadingMessages}
                      typingSpeed={80}
                      deletingSpeed={50}
                      pauseDuration={1500}
                      loop={true}
                      showCursor={true}
                      cursorCharacter="|"
                    />
                  </ShinyText>
                </ListItem>
              </List>
            </Box>
          )}
          <Box sx={{ justifyContent: "center", display: "flex" }}>
            <ChatSection handleSendMessage={handleSendMessage} sx={{ width: "50vw" }} />
          </Box>          
        </Box>
      </Stack>
    </Container>
  );
};

export default ChatNewPage;
