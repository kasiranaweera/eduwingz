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
  IconButton,
  Button,
} from "@mui/material";
import { Container, display } from "@mui/system";
import ChatSection from "../components/ChatSection";
import logoicon from "../assets/logo/eduwingz_logo.png";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import chatApi from "../api/modules/chat.api";
import { useSelector } from "react-redux";

import { AccountCircle } from "@mui/icons-material";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AnimatedCollapsible from "../components/AnimatedCollapsible";

import ReplayIcon from "@mui/icons-material/Replay";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ShareIcon from "@mui/icons-material/Share";
import ReplyAllIcon from "@mui/icons-material/ReplyAll";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import FilePresentOutlinedIcon from "@mui/icons-material/FilePresentOutlined";

const normalizeMessage = (source, sender, fallbackIdPrefix) => {
  if (!source) return null;
  const timestamp = source.timestamp ? new Date(source.timestamp) : new Date();
  return {
    id: source.id ?? `${fallbackIdPrefix}-${timestamp.getTime()}`,
    text: source.content ?? "",
    sender,
    timestamp,
    attachments: Array.isArray(source.documents) ? source.documents : [],
  };
};

const ChatPage = () => {
  const { themeMode } = useSelector((state) => state.themeMode);
  const theme = useTheme();
  const location = useLocation();
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const user_message = location.state?.message || "";

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  /* ---------------------------------------------------------- */
  /* 1. SEND MESSAGE – fixed duplicate logic                    */
  /* ---------------------------------------------------------- */
  const handleSendMessage = async (messageText, attachments = []) => {
    const trimmed = messageText?.trim();
    if (!trimmed) return false;

    // ---- optimistic UI only for *new* sessions ----
    if (!sessionId) {
      const now = new Date();
      const userMessage = {
        id: now.getTime(),
        text: trimmed,
        sender: "user",
        timestamp: now,
        attachments: attachments.map((file, index) => ({
          id: `${now.getTime()}-${index}`,
          filename: file.name,
          processed: false,
          file_url: URL.createObjectURL(file),
        })),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 1,
          text: `Response to: "${trimmed}"`,
          sender: "bot",
          timestamp: new Date(),
          attachments: [],
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsLoading(false);
      }, 1500);
      return true;
    }

    setIsLoading(true);
    let success = false;

    try {
      let documentIds = [];
      if (attachments.length) {
        const uploadedDocuments = [];
        for (const file of attachments) {
          const { response: uploadResponse, err: uploadErr } = await chatApi.uploadDocument(sessionId, file);
          if (uploadErr) {
            console.error("upload document error", uploadErr);
            throw uploadErr;
          }
          uploadedDocuments.push(uploadResponse);
        }
        documentIds = uploadedDocuments
          .map((doc) => doc?.id)
          .filter(Boolean);
      }

      const { response, err } = await chatApi.postMessage(sessionId, {
        content: trimmed,
        document_ids: documentIds,
      });

      if (err) {
        console.error("post message error", err);
        if (typeof err?.detail === "string" && err.detail.toLowerCase().includes("authentication")) {
          navigate("/auth");
        }
        return false;
      }

      if (response) {
        const normalizedUser = normalizeMessage(response.user_message, "user", "user");
        const normalizedAssistant = normalizeMessage(response.assistant_message, "bot", "assistant");

        setMessages((prev) => {
          const out = [...prev];
          if (normalizedUser) out.push(normalizedUser);
          if (normalizedAssistant) out.push(normalizedAssistant);
          return out;
        });
        success = true;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }

    return success;
  };

  /* ---------------------------------------------------------- */
  /* 2. LOAD INITIAL MESSAGES (unchanged)                     */
  /* ---------------------------------------------------------- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (sessionId) {
        setIsLoading(true);
        try {
          const { response, err } = await chatApi.getMessages(sessionId);
          console.log("response", response);
          if (err) {
            console.error(err);
            return;
          }
          if (response && mounted) {
            const pairs = Array.isArray(response)
              ? response
              : response.results || response.data || [];
            const flat = [];
            pairs.forEach((pair, idx) => {
              const userMessage = normalizeMessage(pair.user_message, "user", `u-${idx}`);
              const assistantMessage = normalizeMessage(pair.assistant_message, "bot", `a-${idx}`);
              if (userMessage) flat.push(userMessage);
              if (assistantMessage) flat.push(assistantMessage);
            });
            setMessages(flat);
          }
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // ---- first-time message from route state ----
      if (user_message) {
        const userMessage = {
          id: 1,
          text: user_message,
          sender: "user",
          timestamp: new Date(),
          attachments: [],
        };
        setMessages([userMessage]);

        setIsLoading(true);
        setTimeout(() => {
          const botMessage = {
            id: 2,
            text: `Response to: "${user_message}"`,
            sender: "bot",
            timestamp: new Date(),
            attachments: [],
          };
          setMessages((prev) => [...prev, botMessage]);
          setIsLoading(false);
        }, 1500);
      }
    })();
    return () => (mounted = false);
  }, [sessionId, user_message]);

  /* ---------------------------------------------------------- */
  /* 3. AUTO-SCROLL                                            */
  /* ---------------------------------------------------------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------------------------------------------------------- */
  /* 4. DEBUG CONSOLE LOG (every render)                      */
  /* ---------------------------------------------------------- */
  useEffect(() => {
    console.group("Chat messages (rendered)");
    messages.forEach((m) => {
      console.log(
        `%c[${m.sender.toUpperCase()}] %c${m.text}`,
        "color: #555; font-weight: bold",
        "color: inherit"
      );
      console.log("  id:", m.id, "time:", m.timestamp.toLocaleTimeString());
      if (m.attachments?.length) {
        console.log(
          "  attachments:",
          m.attachments.map((attachment) => attachment.filename || attachment.id).join(", ")
        );
      }
    });
    console.groupEnd();
  }, [messages]);

  console.log("messages", messages);

  /* ---------------------------------------------------------- */
  /* UI (unchanged, only tiny style tweak)                     */
  /* ---------------------------------------------------------- */
  return (
    <Container sx={{ position: "relative", height: window.innerHeight - 100 }}>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Box sx={{ overflowY: "auto", minHeight: window.innerHeight - 250 }}>
          <List sx={{ width: "100%", maxWidth: "75%", mx: "auto" }}>
            {messages.map((message) => (
              <ListItem
                key={message.id}
                sx={{
                  display: "flex",
                  flexDirection:
                    message.sender === "user" ? "row-reverse" : "row",
                  alignItems: "flex-start",
                }}
              >
                {/* Avatar – unchanged */}
                <ListItemAvatar
                  sx={{ alignSelf: "flex-start", minWidth: "40px" }}
                >
                  {message.sender === "user" ? (
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      <AccountCircle />
                    </Avatar>
                  ) : (
                    <img
                      src={logoicon}
                      alt="Bot"
                      style={{ width: 40, height: 40 }}
                    />
                  )}
                </ListItemAvatar>

                {/* ---- MARKDOWN BUBBLE ---- */}
                <Box sx={{ maxWidth: '80%', }}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      ml: message.sender === "user" ? 0 : 1,
                      mr: message.sender === "user" ? 1 : 0,                      
                      bgcolor:
                        message.sender === "user"
                          ? "primary.light"
                          : "background.paper",
                      width: 'auto',                
                      color:
                        message.sender === "user"
                          ? "secondary.contrastText"
                          : "primary.contrastText",
                      borderRadius:
                        message.sender === "user"
                          ? "18px 0 18px 18px"
                          : "0 18px 18px 18px",
                      overflow: "hidden",
                    }}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || "");
                          if (!inline && match) {
                            return (
                              <Box
                                sx={{
                                  my: 1,
                                  p: 1.5,
                                  backgroundColor: "grey.900",
                                  color: "grey.100",
                                  borderRadius: 1,
                                  overflowX: "auto",
                                  fontFamily: "Monospace",
                                  fontSize: "0.85rem",
                                }}
                              >
                                <pre style={{ margin: 0 }}>
                                  <code>
                                    {String(children).replace(/\n$/, "")}
                                  </code>
                                </pre>
                              </Box>
                            );
                          }
                          return (
                            <code
                              style={{
                                backgroundColor: "rgba(0,0,0,0.07)",
                                padding: "0.2em 0.4em",
                                borderRadius: "3px",
                                fontSize: "0.9em",
                              }}
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                        h1: ({ children }) => (
                          <Box
                            component="h1"
                            sx={{ fontSize: "1.4rem", mt: 1.5, mb: 0.5 }}
                          >
                            {children}
                          </Box>
                        ),
                        h2: ({ children }) => (
                          <Box
                            component="h2"
                            sx={{ fontSize: "1.2rem", mt: 1.2, mb: 0.5 }}
                          >
                            {children}
                          </Box>
                        ),
                        ul: ({ children }) => (
                          <Box component="ul" sx={{ pl: 2, my: 1 }}>
                            {children}
                          </Box>
                        ),
                        ol: ({ children }) => (
                          <Box component="ol" sx={{ pl: 2, my: 1 }}>
                            {children}
                          </Box>
                        ),
                      }}
                    >
                      {message.text}
                    </ReactMarkdown>

                    {message.attachments?.length ? (
                      <Box
                        sx={{
                          mt: 1,
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.5,
                        }}
                      >
                        {message.attachments.map((attachment) => (
                          <Button
                            key={attachment.id || attachment.filename}
                            variant="outlined"
                            size="small"
                            startIcon={<FilePresentOutlinedIcon fontSize="small" />}
                            sx={{
                              justifyContent: "flex-start",
                              textTransform: "none",
                              borderColor:
                                message.sender === "user"
                                  ? "secondary.contrastText"
                                  : "divider",
                              color:
                                message.sender === "user"
                                  ? "secondary.contrastText"
                                  : "primary.contrastText",
                              "&:hover": {
                                borderColor: "primary.main",
                                color: "primary.main",
                              },
                              maxWidth: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            onClick={() => {
                              if (attachment.file_url) {
                                window.open(attachment.file_url, "_blank", "noopener,noreferrer");
                              }
                            }}
                            disabled={!attachment.file_url}
                          >
                            {attachment.filename || "Attachment"}
                          </Button>
                        ))}
                      </Box>
                    ) : null}

                    <Box
                      sx={{
                        fontSize: "0.75rem",
                        mt: 1,
                        color:
                          message.sender === "user"
                            ? "secondary.contrastText"
                            : "primary.contrastText",
                        opacity: 0.7,
                      }}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </Box>
                  </Paper>
                  {message.sender === "user" ? (
                    <></>
                  ) : (
                    <Box sx={{ p: 1 }}>
                      <IconButton>
                        <ReplayIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                      <IconButton>
                        <ContentCopyIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                      <IconButton>
                        <ReplyAllIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                      <IconButton>
                        <FavoriteBorderIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                      <IconButton>
                        <StarOutlineIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                      <IconButton>
                        <VolumeUpIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                      <IconButton>
                        <MoreHorizIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </ListItem>
            ))}

            {isLoading && (
              <ListItem sx={{ justifyContent: "center" }}>
                <CircularProgress size={24} />
              </ListItem>
            )}
            <Box ref={messagesEndRef} />
          </List>
        </Box>
      </Box>

      {/* <AnimatedCollapsible sx
        handleSendMessage={handleSendMessage}
      /> */}
      <ChatSection
        sx={{ position: "sticky", bottom: 0, width: "75%", mx: "auto" }}
        handleSendMessage={handleSendMessage}
      />
    </Container>
  );
};

export default ChatPage;
