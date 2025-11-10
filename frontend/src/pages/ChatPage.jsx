// import React, { useState, useRef, useEffect } from "react";
// import {
//   Box,
//   Avatar,
//   List,
//   ListItem,
//   ListItemAvatar,
//   ListItemText,
//   Paper,
//   CircularProgress,
//   useTheme,
//   useMediaQuery,
// } from "@mui/material";
// import {
//   AccountCircle,
// } from "@mui/icons-material";
// import { Container } from "@mui/system";
// import ChatSection from "../components/ChatSection";
// import logoicon from "../assets/logo/eduwingz_logo.png";
// import { useLocation, useParams, useNavigate } from "react-router-dom";
// import chatApi from "../api/modules/chat.api";
// import { useSelector } from "react-redux";

// const ChatPage = () => {
//     const { themeMode } = useSelector((state) => state.themeMode);

//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
//   const location = useLocation();
//   // If opened from a session route, `sessionId` will be present in params
//   const { sessionId } = useParams();
//   const navigate = useNavigate();
//   const user_message = location.state?.message || "";
//   const [messages, setMessages] = useState([
//     // {
//     //   id: 1,
//     //   text: user_message,
//     //   sender: "user",
//     //   timestamp: new Date(),
//     // },
//     // {
//     //   id: 2,
//     //   text: "Based on the information provided, EduWingz appears to be an educational platform with a technical infrastructure that includes React.js for frontend development and Django framework for the backend. \n\nThe implementation of EduWingz requires careful consideration of software, hardware, and data resources. The React.js frontend ensures a responsive and interactive user interface for users, while the Django backend provides robust server-side functionality. \n Without additional information in the provided context, I can't determine the specific educational features, target audience, or exact purpose of EduWingz beyond it being a web-based educational platform with the technical stack mentioned.",
//     //   sender: "bot",
//     //   timestamp: new Date(),
//     // },
//   ]);
//   const [inputValue, setInputValue] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const messagesEndRef = useRef(null);

//   const handleSendMessage = (messageText) => {

//     // Add user message to chat
//     const userMessage = {
//       id: messages.length + 1,
//       text: messageText,
//       sender: "user",
//       timestamp: new Date(),
//     };
//     setMessages([...messages, userMessage]);

//     // Simulate bot response
//     setIsLoading(true);
//     (async () => {
//       try {
//         // If we have a sessionId, post to backend; otherwise just simulate
//         if (sessionId) {
//           const { response, err } = await chatApi.postMessage(sessionId, { content: messageText });
//           if (err) {
//             console.error('post message error', err);
//             // on auth error, redirect to login
//             if (err?.detail && err.detail.toString().toLowerCase().includes('authentication')) {
//               navigate('/auth');
//               return;
//             }
//           } else if (response) {
//             // response contains user_message and assistant_message
//             const um = response.user_message;
//             const am = response.assistant_message;
//             setMessages((prev) => {
//               const out = [...prev];
//               if (um) out.push({ id: um.id, text: um.content, sender: 'user', timestamp: um.timestamp ? new Date(um.timestamp) : new Date() });
//               if (am) out.push({ id: am.id, text: am.content, sender: 'bot', timestamp: am.timestamp ? new Date(am.timestamp) : new Date() });
//               return out;
//             });
//             setIsLoading(false);
//             return;
//           }
//         }

//         // fallback: local simulated response
//         setTimeout(() => {
//           const botMessage = {
//             id: messages.length + 2,
//             text: `Response to: "${messageText}"`,
//             sender: "bot",
//             timestamp: new Date(),
//           };
//           setMessages((prev) => [...prev, botMessage]);
//           setIsLoading(false);
//         }, 1500);
//       } catch (e) {
//         console.error(e);
//         setIsLoading(false);
//       }
//     })();
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   // Auto-scroll to bottom when messages change
//   // useEffect(() => {
//   //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   // }, [messages]);

//   useEffect(() => {
//     // If sessionId present, load messages from backend
//     let mounted = true;
//     (async () => {
//       if (sessionId) {
//         try {
//           setIsLoading(true);
//           const { response, err } = await chatApi.getMessages(sessionId);
//           setIsLoading(false);
//           if (err) {
//             console.error('get messages error', err);
//             return;
//           }
//             if (response && mounted) {
//               // backend returns an array of pairs: { user_message: {...}, assistant_message: {...} }
//               const pairs = Array.isArray(response) ? response : (response.results || response.data || []);
//               const flat = [];
//               pairs.forEach((pair, idx) => {
//                 const u = pair.user_message;
//                 if (u) {
//                   flat.push({
//                     id: u.id ?? `u-${idx}`,
//                     text: u.content ?? '',
//                     sender: 'user',
//                     timestamp: u.timestamp ? new Date(u.timestamp) : new Date()
//                   });
//                 }
//                 const a = pair.assistant_message;
//                 if (a) {
//                   flat.push({
//                     id: a.id ?? `a-${idx}`,
//                     text: a.content ?? '',
//                     sender: 'bot',
//                     timestamp: a.timestamp ? new Date(a.timestamp) : new Date()
//                   });
//                 }
//               });
//               setMessages(flat);
//             }
//         } catch (e) {
//           console.error(e);
//         }
//         return;
//       }

//       if (user_message) {
//         const userMessage = {
//           id: 1,
//           text: user_message,
//           sender: "user",
//           timestamp: new Date(),
//         };
//         setMessages((prev) => [...prev, userMessage]);

//         setIsLoading(true);
//         setTimeout(() => {
//           const botMessage = {
//             id: 2,
//             text: `Response to: "${user_message}"`,
//             sender: "bot",
//             timestamp: new Date(),
//           };
//           setMessages((prev) => [...prev, botMessage]);
//           setIsLoading(false);
//         }, 1500);
//       }
//     })();
//   }, [user_message, sessionId]);

//   return (
//     <Container sx={{ position: "relative", height: window.innerHeight - 100 }}>
//       <Box
//         sx={{
//           display: "flex",
//           flexDirection: "column",
//         }}
//       >
//         {/* Chat Messages Area */}
//         <Box
//           sx={{
//             overflowY: "visible",
//             minHeight: window.innerHeight - 250,
//           }}
//         >
//           <List sx={{ width: "100%", maxWidth: "75%", mx: "auto" }}>
//             {messages.map((message) => (
//               <ListItem
//                 key={message.id}
//                 sx={{
//                   display: "flex",
//                   flexDirection:
//                     message.sender === "user" ? "row-reverse" : "row",
//                   alignItems: "center",
//                 }}
//               >
//                 <ListItemAvatar
//                   sx={{
//                     alignSelf: "flex-start",
//                     minWidth: "40px",
//                   }}
//                 >
//                   {message.sender === "user" ? (
//                     <Avatar sx={{ bgcolor: "primary.main" }}>
//                       <AccountCircle />
//                     </Avatar>
//                   ) : (
//                     <img
//                       src={logoicon}
//                       alt="Bot Avatar"
//                       style={{
//                         width: "40px",
//                         height: "40px",
//                       }}
//                     />
//                   )}
//                 </ListItemAvatar>
//                 <Paper
//                   elevation={2}
//                   sx={{
//                     p: 2,
//                     ml: message.sender === "user" ? 0 : 1,
//                     mr: message.sender === "user" ? 1 : 0,
//                     maxWidth: "75%",
//                     bgcolor:
//                       message.sender === "user"
//                         ? "primary.light"
//                         : "background.paper",
//                     color:
//                       message.sender === "user"
//                         ? "secondary.contrastText"
//                         : "primary.contrastText",
//                     borderRadius:
//                       message.sender === "user"
//                         ? "18px 0 18px 18px"
//                         : "0 18px 18px 18px",
//                   }}
//                 >
//                   <ListItemText
//                     primary={message.text}
//                     secondary={message.timestamp.toLocaleTimeString()}
//                     secondaryTypographyProps={{
//                       color:
//                         message.sender === "user"
//                           ? "secondary.contrastText"
//                           : "primary.contrastText",
//                       fontSize: "0.75rem",
//                       marginTop: 1,
//                     }}
//                   />
//                 </Paper>
//               </ListItem>
//             ))}
//             {isLoading && (
//               <ListItem sx={{ justifyContent: "center" }}>
//                 <CircularProgress size={24} />
//               </ListItem>
//             )}
//             <div ref={messagesEndRef} />
//           </List>
//         </Box>
//       </Box>
//       <ChatSection
//         className="chatSection"
//         sx={{ position: "sticky", bottom: 0, width: "100%" }}
//         handleSendMessage={handleSendMessage}
//       />
//     </Container>
//   );
// };

// export default ChatPage;

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

const ChatPage = () => {
  const { themeMode } = useSelector((state) => state.themeMode);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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
  const handleSendMessage = async (messageText) => {
    if (!messageText?.trim()) return;

    // ---- optimistic UI only for *new* sessions ----
    if (!sessionId) {
      const userMessage = {
        id: Date.now(),
        text: messageText,
        sender: "user",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
    }

    setIsLoading(true);

    try {
      if (sessionId) {
        const { response, err } = await chatApi.postMessage(sessionId, {
          content: messageText,
        });

        if (err) {
          console.error("post message error", err);
          if (err?.detail?.toLowerCase().includes("authentication")) {
            navigate("/auth");
          }
          return;
        }

        if (response) {
          const um = response.user_message;
          const am = response.assistant_message;

          setMessages((prev) => {
            const out = [...prev];
            if (um)
              out.push({
                id: um.id,
                text: um.content,
                sender: "user",
                timestamp: new Date(um.timestamp),
              });
            if (am)
              out.push({
                id: am.id,
                text: am.content,
                sender: "bot",
                timestamp: new Date(am.timestamp),
              });
            return out;
          });
        }
      } else {
        // ---- local simulation ----
        setTimeout(() => {
          const botMessage = {
            id: Date.now() + 1,
            text: `Response to: "${messageText}"`,
            sender: "bot",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, botMessage]);
          setIsLoading(false);
        }, 1500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------------------------------------------------- */
  /* 2. LOAD INITIAL MESSAGES (unchanged)                     */
  /* ---------------------------------------------------------- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (sessionId) {
        setIsLoading(true);
        const { response, err } = await chatApi.getMessages(sessionId);
        setIsLoading(false);
        if (err) return console.error(err);
        if (response && mounted) {
          const pairs = Array.isArray(response)
            ? response
            : response.results || response.data || [];
          const flat = [];
          pairs.forEach((pair, idx) => {
            const u = pair.user_message;
            const a = pair.assistant_message;
            if (u)
              flat.push({
                id: u.id ?? `u-${idx}`,
                text: u.content ?? "",
                sender: "user",
                timestamp: u.timestamp ? new Date(u.timestamp) : new Date(),
              });
            if (a)
              flat.push({
                id: a.id ?? `a-${idx}`,
                text: a.content ?? "",
                sender: "bot",
                timestamp: a.timestamp ? new Date(a.timestamp) : new Date(),
              });
          });
          setMessages(flat);
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
        };
        setMessages([userMessage]);

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
    });
    console.groupEnd();
  }, [messages]);

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
                <Box sx={{}}>
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
                        <ShareIcon sx={{ fontSize: 18 }} />
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
