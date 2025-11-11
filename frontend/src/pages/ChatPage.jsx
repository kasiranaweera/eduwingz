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
  Typography,
  Tooltip,
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
import BookmarksOutlinedIcon from '@mui/icons-material/BookmarksOutlined';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import FilePresentOutlinedIcon from "@mui/icons-material/FilePresentOutlined";
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';

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
        console.log(`Uploading ${attachments.length} file(s)...`);
        const uploadedDocuments = [];
        for (const file of attachments) {
          console.log(`Uploading file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
          const { response: uploadResponse, err: uploadErr } = await chatApi.uploadDocument(sessionId, file);
          if (uploadErr) {
            console.error("upload document error", uploadErr);
            throw uploadErr;
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

        // Check if documents are already in the response, otherwise fetch them
        if (normalizedUser) {
          // If documents are already in the response, use them
          if (normalizedUser.attachments && normalizedUser.attachments.length > 0) {
            console.log("Documents already in response:", normalizedUser.attachments);
          } 
          // Otherwise, if we uploaded documents, fetch them
          else if (documentIds.length > 0 && normalizedUser.id) {
            console.log(`Fetching documents for message ${normalizedUser.id}...`);
            try {
              const { response: docsResponse, err: docsErr } = await chatApi.getDocumentsByMessage(normalizedUser.id);
              if (!docsErr && docsResponse && Array.isArray(docsResponse)) {
                normalizedUser.attachments = docsResponse;
                console.log("Fetched documents:", docsResponse);
              } else if (docsErr) {
                console.error("Error fetching documents:", docsErr);
              }
            } catch (e) {
              console.error(`Error fetching documents for new message ${normalizedUser.id}:`, e);
            }
          }
        }

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
  /* 2. LOAD INITIAL MESSAGES with documents                  */
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
            
            // First, create messages without documents
            pairs.forEach((pair, idx) => {
              const userMessage = normalizeMessage(pair.user_message, "user", `u-${idx}`);
              const assistantMessage = normalizeMessage(pair.assistant_message, "bot", `a-${idx}`);
              if (userMessage) flat.push(userMessage);
              if (assistantMessage) flat.push(assistantMessage);
            });
            setMessages(flat);

            // Then, fetch documents for each user message
            if (mounted) {
              const updatedMessages = [...flat];
              const documentPromises = flat
                .filter((msg) => msg.sender === "user" && msg.id)
                .map(async (userMsg, index) => {
                  try {
                    const { response: docsResponse, err: docsErr } = await chatApi.getDocumentsByMessage(userMsg.id);
                    if (!docsErr && docsResponse && Array.isArray(docsResponse)) {
                      // Find the message in the array and update it
                      const msgIndex = updatedMessages.findIndex((m) => m.id === userMsg.id);
                      if (msgIndex !== -1) {
                        updatedMessages[msgIndex] = {
                          ...updatedMessages[msgIndex],
                          attachments: docsResponse,
                        };
                      }
                    }
                  } catch (e) {
                    console.error(`Error fetching documents for message ${userMsg.id}:`, e);
                  }
                });

              // Wait for all document fetches to complete
              await Promise.all(documentPromises);
              
              // Update messages with documents
              if (mounted) {
                setMessages(updatedMessages);
              }
            }
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
                    <>{message.attachments?.length ? (
                      <Box
                        sx={{
                          mt: 1,
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.5,
                        }}
                      >
                        {message.attachments.map((attachment) => (<>                          
                          <Box sx={{ justifyContent: "right", display: "flex" }} key={attachment.id || attachment.filename}>
                            <Box
                              sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 1,
                                border: 1,
                                borderColor: "graycolor.two",
                                borderRadius: 3,
                                p: 1,
                              }}
                              onClick={() => {
                                if (attachment.file_url) {
                                  window.open(attachment.file_url, "_blank", "noopener,noreferrer");
                                }
                              }}
                            >
                              {attachment?.filename?.endsWith(".png") || attachment?.filename?.endsWith(".jpg") || attachment?.filename?.endsWith(".jpeg")  || attachment?.filename?.endsWith(".webp") ? (
                                <Avatar variant="rounded" src={attachment.file_url || undefined} alt={attachment.filename}>
                                  <ImageOutlinedIcon />
                                </Avatar>
                              ) : attachment?.filename?.endsWith(".pdf") ? (
                                <Avatar variant="rounded">
                                  <PictureAsPdfOutlinedIcon />
                                </Avatar>
                              ) : (
                                <Avatar variant="rounded">
                                  <UploadFileOutlinedIcon />
                                </Avatar>
                              )}
      
                              <Box sx={{ }}>
                                <Typography variant="body2">{attachment.filename}</Typography>
                                {/* <Typography variant="caption" color="text.secondary">
                                  {attachment.id}
                                </Typography> */}
                              </Box>
                            </Box>
                          
                        </Box>
                        </>
                        ))}
                      </Box>
                    ) : null}</>
                  ) : (
                    <Box sx={{ p: 1 }}>
                      <Tooltip title="Regenerate" arrow>
                      <IconButton>
                        <ReplayIcon sx={{ fontSize: 18 }} />
                      </IconButton></Tooltip>
                      <Tooltip title="Copy Response" arrow>
                      <IconButton>
                        <ContentCopyIcon sx={{ fontSize: 18 }} />
                      </IconButton></Tooltip>
                      <Tooltip title="Target Reply" arrow>
                      <IconButton>
                        <ReplyAllIcon sx={{ fontSize: 18 }} />
                      </IconButton></Tooltip>
                      <Tooltip title="Good Response" arrow>
                      <IconButton>
                        <FavoriteBorderIcon sx={{ fontSize: 18 }} />
                      </IconButton></Tooltip>
                      <Tooltip title="Add to Bookmarks" arrow>
                      <IconButton>
                        <BookmarksOutlinedIcon sx={{ fontSize: 18 }} />
                      </IconButton></Tooltip>
                      <Tooltip title="Activate Voice" arrow>
                      <IconButton>
                        <VolumeUpIcon sx={{ fontSize: 18 }} />
                      </IconButton></Tooltip>
                      <Tooltip title="More Options" arrow>
                      <IconButton>
                        <MoreHorizIcon sx={{ fontSize: 18 }} />
                      </IconButton></Tooltip>
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
