import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  AccountCircle,
} from "@mui/icons-material";
import { Container } from "@mui/system";
import ChatSection from "../components/ChatSection";
import logoicon from "../assets/logo/eduwingz_logo.png";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ChatPage = () => {
    const { themeMode } = useSelector((state) => state.themeMode);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();
  const user_message = location.state?.message || "";
  const [messages, setMessages] = useState([
    // {
    //   id: 1,
    //   text: user_message,
    //   sender: "user",
    //   timestamp: new Date(),
    // },
    // {
    //   id: 2,
    //   text: "Based on the information provided, EduWingz appears to be an educational platform with a technical infrastructure that includes React.js for frontend development and Django framework for the backend. \n\nThe implementation of EduWingz requires careful consideration of software, hardware, and data resources. The React.js frontend ensures a responsive and interactive user interface for users, while the Django backend provides robust server-side functionality. \n Without additional information in the provided context, I can't determine the specific educational features, target audience, or exact purpose of EduWingz beyond it being a web-based educational platform with the technical stack mentioned.",
    //   sender: "bot",
    //   timestamp: new Date(),
    // },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const handleSendMessage = (messageText) => {

    // Add user message to chat
    const userMessage = {
      id: messages.length + 1,
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages([...messages, userMessage]);

    // Simulate bot response
    setIsLoading(true);
    setTimeout(() => {
      const botMessage = {
        id: messages.length + 2,
        text: `Response to: "${messageText}"`,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-scroll to bottom when messages change
  // useEffect(() => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // }, [messages]);

  useEffect(() => {
    if (user_message) {
      const userMessage = {
        id: 1,
        text: user_message,
        sender: "user",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
  
      setIsLoading(true);
      setTimeout(() => {
        const botMessage = {
          id: 2,
          text: `Response to: "${user_message}"`,
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsLoading(false);
      }, 1500);
    }
  }, [user_message]);

  return (
    <Container sx={{ position: "relative", height: window.innerHeight - 100 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Chat Messages Area */}
        <Box
          sx={{
            overflowY: "visible",
            minHeight: window.innerHeight - 250,
          }}
        >
          <List sx={{ width: "100%", maxWidth: "75%", mx: "auto" }}>
            {messages.map((message) => (
              <ListItem
                key={message.id}
                sx={{
                  display: "flex",
                  flexDirection:
                    message.sender === "user" ? "row-reverse" : "row",
                  alignItems: "center",
                }}
              >
                <ListItemAvatar
                  sx={{
                    alignSelf: "flex-start",
                    minWidth: "40px",
                  }}
                >
                  {message.sender === "user" ? (
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      <AccountCircle />
                    </Avatar>
                  ) : (
                    <img
                      src={logoicon}
                      alt="Bot Avatar"
                      style={{
                        width: "40px",
                        height: "40px",
                      }}
                    />
                  )}
                </ListItemAvatar>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    ml: message.sender === "user" ? 0 : 1,
                    mr: message.sender === "user" ? 1 : 0,
                    maxWidth: "75%",
                    bgcolor:
                      message.sender === "user"
                        ? "primary.light"
                        : "background.paper",
                    color:
                      message.sender === "user"
                        ? "secondary.contrastText"
                        : "primary.contrastText",
                    borderRadius:
                      message.sender === "user"
                        ? "18px 0 18px 18px"
                        : "0 18px 18px 18px",
                  }}
                >
                  <ListItemText
                    primary={message.text}
                    secondary={message.timestamp.toLocaleTimeString()}
                    secondaryTypographyProps={{
                      color:
                        message.sender === "user"
                          ? "secondary.contrastText"
                          : "primary.contrastText",
                      fontSize: "0.75rem",
                      marginTop: 1,
                    }}
                  />
                </Paper>
              </ListItem>
            ))}
            {isLoading && (
              <ListItem sx={{ justifyContent: "center" }}>
                <CircularProgress size={24} />
              </ListItem>
            )}
            <div ref={messagesEndRef} />
          </List>
        </Box>
      </Box>
      <ChatSection
        className="chatSection"
        sx={{ position: "sticky", bottom: 0, width: "100%" }}
        handleSendMessage={handleSendMessage}
      />
    </Container>
  );
};

export default ChatPage;
