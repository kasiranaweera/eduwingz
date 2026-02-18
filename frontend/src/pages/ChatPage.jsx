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
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { Container, display } from "@mui/system";
import ChatSection from "../components/ChatSection";
import logoicon from "../assets/logo/eduwingz_logo.png";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import chatApi from "../api/modules/chat.api";
import notificationApi from "../api/modules/notification.api";
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
import FavoriteIcon from "@mui/icons-material/Favorite";
import BookmarksIcon from "@mui/icons-material/Bookmarks";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import BookmarksOutlinedIcon from "@mui/icons-material/BookmarksOutlined";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import FilePresentOutlinedIcon from "@mui/icons-material/FilePresentOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import ShinyText from "../components/common/ShinyText";
import TextType from "../components/common/TextType";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";

// Remove <think>...</think> tags and all content within them
const sanitizeMessageText = (text) => {
  if (!text || typeof text !== "string") return text || "";
  // Remove <think>...</think> blocks entirely (case-insensitive, handles multiline)
  return text.replace(/<think\b[\s\S]*?<\/think>/gi, "").trim();
};

const normalizeMessage = (source, sender, fallbackIdPrefix) => {
  if (!source) return null;
  const timestamp = source.timestamp ? new Date(source.timestamp) : new Date();
  return {
    id: source.id ?? `${fallbackIdPrefix}-${timestamp.getTime()}`,
    // sanitize text to hide any <think> tags coming from the API
    text: sanitizeMessageText(source.content ?? ""),
    sender,
    timestamp,
    attachments: Array.isArray(source.documents) ? source.documents : [],
    is_incomplete: source.is_incomplete ?? false,
    is_good: source.is_good ?? false,
    is_bookmarked: source.is_bookmarked ?? false,
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
  const [animatedMessages, setAnimatedMessages] = useState(new Set());
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [animatedTexts, setAnimatedTexts] = useState({});
  const sendingRef = useRef(false);

  const [handleCopyMessage, setHandleCopyMessage] = useState(false);
  const [handleCopyMessageId, setHandleCopyMessageId] = useState(null);
  const [activeVoice, setActiveVoice] = useState(null);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const audioRef = useRef(null);

  // State for more options menu
  const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);
  const [selectedMessageForMenu, setSelectedMessageForMenu] = useState(null);

  // State for report dialog
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportingMessage, setReportingMessage] = useState(null);

  // State for quoted message
  const [quotedMessage, setQuotedMessage] = useState(null);

  const loadingMessages = [
    "Thinking...",
    "Searching knowledge base...",
    "Summarizing your data...",
    "Analyzing your document...",
    "AI is thinking...",
    "Processing your request...",
    "Gathering information...",
  ];

  /* ---------------------------------------------------------- */
  /* 1. SEND MESSAGE – fixed duplicate logic                    */
  /* ---------------------------------------------------------- */
  const handleSendMessage = async (messageText, attachments = []) => {
    const trimmed = messageText?.trim();
    if (!trimmed) return false;

    // Prevent multiple simultaneous sends
    if (sendingRef.current) {
      console.warn("Message send already in progress");
      return false;
    }
    sendingRef.current = true;

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
      setMessages((prev) => {
        // Check for duplicates
        if (!prev.find((m) => m.id === userMessage.id)) {
          return [...prev, userMessage];
        }
        return prev;
      });
      setIsLoading(true);
      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 1,
          text: `Response to: "${trimmed}"`,
          sender: "bot",
          timestamp: new Date(),
          attachments: [],
        };
        setMessages((prev) => {
          // Check for duplicates
          if (!prev.find((m) => m.id === botMessage.id)) {
            return [...prev, botMessage];
          }
          return prev;
        });
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
          console.log(
            `Uploading file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`
          );
          const { response: uploadResponse, err: uploadErr } =
            await chatApi.uploadDocument(sessionId, file);
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
        documentIds = uploadedDocuments.map((doc) => doc?.id).filter(Boolean);
        console.log(
          `Successfully uploaded ${documentIds.length} document(s). IDs:`,
          documentIds
        );
      }

      const { response, err } = await chatApi.postMessage(sessionId, {
        content: trimmed,
        document_ids: documentIds,
      });

      if (err) {
        console.error("post message error", err);
        if (
          typeof err?.detail === "string" &&
          err.detail.toLowerCase().includes("authentication")
        ) {
          navigate("/auth");
        }
        return false;
      }

      if (response) {
        const normalizedUser = normalizeMessage(
          response.user_message,
          "user",
          "user"
        );
        const normalizedAssistant = normalizeMessage(
          response.assistant_message,
          "bot",
          "assistant"
        );

        // Check if documents are already in the response, otherwise fetch them
        if (normalizedUser) {
          // If documents are already in the response, use them
          if (
            normalizedUser.attachments &&
            normalizedUser.attachments.length > 0
          ) {
            console.log(
              "Documents already in response:",
              normalizedUser.attachments
            );
          }
          // Otherwise, if we uploaded documents, fetch them
          else if (documentIds.length > 0 && normalizedUser.id) {
            console.log(
              `Fetching documents for message ${normalizedUser.id}...`
            );
            try {
              const { response: docsResponse, err: docsErr } =
                await chatApi.getDocumentsByMessage(normalizedUser.id);
              if (!docsErr && docsResponse && Array.isArray(docsResponse)) {
                normalizedUser.attachments = docsResponse;
                console.log("Fetched documents:", docsResponse);
              } else if (docsErr) {
                console.error("Error fetching documents:", docsErr);
              }
            } catch (e) {
              console.error(
                `Error fetching documents for new message ${normalizedUser.id}:`,
                e
              );
            }
          }
        }

        setMessages((prev) => {
          const out = [...prev];
          // Check for duplicates before adding
          if (normalizedUser && !out.find((m) => m.id === normalizedUser.id)) {
            out.push(normalizedUser);
          }
          if (
            normalizedAssistant &&
            !out.find((m) => m.id === normalizedAssistant.id)
          ) {
            out.push(normalizedAssistant);
            // Don't mark new messages as animated - let them animate
            // Only existing messages (from API) should skip animation
          }
          return out;
        });
        // Clear quoted message after successful send
        setQuotedMessage(null);
        success = true;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      sendingRef.current = false;
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
              const userMessage = normalizeMessage(
                pair.user_message,
                "user",
                `u-${idx}`
              );
              const assistantMessage = normalizeMessage(
                pair.assistant_message,
                "bot",
                `a-${idx}`
              );
              if (userMessage) flat.push(userMessage);
              if (assistantMessage) flat.push(assistantMessage);
            });
            setMessages(flat);

            // Mark all existing bot messages as already animated (skip animation on load)
            if (mounted) {
              const botMessageIds = flat
                .filter((msg) => msg.sender === "bot" && msg.id)
                .map((msg) => msg.id);
              if (botMessageIds.length > 0) {
                setAnimatedMessages((prev) => {
                  const newSet = new Set(prev);
                  botMessageIds.forEach((id) => newSet.add(id));
                  return newSet;
                });
              }
            }

            // Then, fetch documents for each user message
            if (mounted) {
              const updatedMessages = [...flat];
              const documentPromises = flat
                .filter((msg) => msg.sender === "user" && msg.id)
                .map(async (userMsg, index) => {
                  try {
                    const { response: docsResponse, err: docsErr } =
                      await chatApi.getDocumentsByMessage(userMsg.id);
                    if (
                      !docsErr &&
                      docsResponse &&
                      Array.isArray(docsResponse)
                    ) {
                      // Find the message in the array and update it
                      const msgIndex = updatedMessages.findIndex(
                        (m) => m.id === userMsg.id
                      );
                      if (msgIndex !== -1) {
                        updatedMessages[msgIndex] = {
                          ...updatedMessages[msgIndex],
                          attachments: docsResponse,
                        };
                      }
                    }
                  } catch (e) {
                    console.error(
                      `Error fetching documents for message ${userMsg.id}:`,
                      e
                    );
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
          setMessages((prev) => {
            // Check for duplicates
            if (!prev.find((m) => m.id === botMessage.id)) {
              return [...prev, botMessage];
            }
            return prev;
          });
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
  /* 4. LOADING MESSAGE ROTATION                               */
  /* ---------------------------------------------------------- */
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

  /* ---------------------------------------------------------- */
  /* 5. MESSAGE ANIMATION TRACKING                             */
  /* ---------------------------------------------------------- */
  const handleAnimationComplete = (messageId) => {
    setAnimatedMessages((prev) => new Set([...prev, messageId]));
    // Clear the animated text when animation completes to avoid showing both versions
    setAnimatedTexts((prev) => {
      const newTexts = { ...prev };
      delete newTexts[messageId];
      return newTexts;
    });
  };

  const handleTextUpdate = (messageId, text) => {
    setAnimatedTexts((prev) => ({
      ...prev,
      [messageId]: text,
    }));
  };

  /* ---------------------------------------------------------- */
  /* 6. DEBUG CONSOLE LOG (every render)                      */
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
          m.attachments
            .map((attachment) => attachment.filename || attachment.id)
            .join(", ")
        );
      }
    });
    console.groupEnd();
  }, [messages]);

  const handleCopy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setHandleCopyMessage(true);
      setHandleCopyMessageId(id);
      setTimeout(() => {
        setHandleCopyMessage(false);
        setHandleCopyMessageId(null);
      }, 3000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  /* ---------------------------------------------------------- */
  /* CONTINUE MESSAGE HANDLER                                  */
  /* ---------------------------------------------------------- */
  const handleContinueMessage = async (messageId) => {
    if (!sessionId || isLoading) return;

    setIsLoading(true);
    try {
      const { response, err } = await chatApi.continueMessage(sessionId);
      if (err) {
        console.error("Error continuing message:", err);
        return;
      }

      if (response) {
        // Find the message and update it
        setMessages((prev) => {
          return prev.map((msg) => {
            if (msg.id === messageId && msg.sender === "bot") {
              return {
                ...msg,
                text: response.full_answer || response.answer || msg.text,
                is_incomplete: response.is_incomplete || false,
              };
            }
            return msg;
          });
        });
      }
    } catch (e) {
      console.error("Error continuing message:", e);
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------------------------------------------------- */
  /* REGENERATE MESSAGE HANDLER                                */
  /* ---------------------------------------------------------- */
  const handleRegenerateMessage = async (messageId) => {
    if (!sessionId || isLoading) return;

    console.log(
      "🔄 [Regenerate] Starting regeneration for message:",
      messageId
    );
    setIsLoading(true);

    try {
      // Find the user message that precedes this bot message
      const messageIndex = messages.findIndex((m) => m.id === messageId);
      if (messageIndex === -1) {
        console.error("Message not found");
        return;
      }

      // Get the previous user message
      let userMessageContent = "";
      for (let i = messageIndex - 1; i >= 0; i--) {
        if (messages[i].sender === "user") {
          userMessageContent = messages[i].text;
          break;
        }
      }

      if (!userMessageContent) {
        console.error("No user message found to regenerate");
        alert("Could not find the original user message");
        return;
      }

      console.log(
        "📝 [Regenerate] Regenerating response for:",
        userMessageContent.substring(0, 50)
      );

      // Call API to regenerate
      const { response, err } = await chatApi.postMessage(sessionId, {
        content: userMessageContent,
      });

      if (err) {
        console.error("❌ [Regenerate] Error:", err);
        alert(`Regeneration failed: ${err?.detail || err?.message || err}`);
        return;
      }

      if (response) {
        console.log("✅ [Regenerate] Success");
        const normalizedAssistant = normalizeMessage(
          response.assistant_message,
          "bot",
          "assistant"
        );

        if (normalizedAssistant) {
          // Replace the existing bot message with the new one
          setMessages((prev) => {
            return prev.map((msg) => {
              if (msg.id === messageId) {
                return normalizedAssistant;
              }
              return msg;
            });
          });
          // Clear animation state for regenerated message
          setAnimatedMessages((prev) => {
            const newSet = new Set(prev);
            newSet.delete(messageId);
            return newSet;
          });
          setAnimatedTexts((prev) => {
            const newTexts = { ...prev };
            delete newTexts[messageId];
            return newTexts;
          });
        }
      }
    } catch (e) {
      console.error("❌ [Regenerate] Unexpected error:", e);
      alert(`Regeneration error: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------------------------------------------------- */
  /* TARGET REPLY HANDLER                                      */
  /* ---------------------------------------------------------- */
  const handleTargetReply = (messageText) => {
    if (!messageText) return;

    console.log("📌 [TargetReply] Setting quoted message:", messageText.substring(0, 50));
    
    // Set the quoted message in state
    setQuotedMessage(messageText);
    
    // Scroll to the input field
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  /* ---------------------------------------------------------- */
  /* GOOD RESPONSE HANDLER (Feedback)                          */
  /* ---------------------------------------------------------- */
  const handleGoodResponse = async (messageId) => {
    // Find the current message to get its current is_good status
    const currentMessage = messages.find((msg) => msg.id === messageId);
    if (!currentMessage) {
      console.error("Message not found:", messageId);
      return;
    }

    // Toggle the is_good status
    const newIsGoodStatus = !currentMessage.is_good;
    console.log(
      `👍 [Feedback] Toggling good response for ${messageId}: ${currentMessage.is_good} → ${newIsGoodStatus}`
    );

    try {
      // Update the local message state immediately (optimistic update)
      setMessages((prev) => {
        return prev.map((msg) => {
          if (msg.id === messageId) {
            return { ...msg, is_good: newIsGoodStatus };
          }
          return msg;
        });
      });

      // Mark the message as good/not good in the database
      const { response, err } = await notificationApi.markMessageGood(
        sessionId,
        messageId,
        newIsGoodStatus
      );

      if (err) {
        console.error("❌ [Feedback] Error:", err);
        // Revert optimistic update on error
        setMessages((prev) => {
          return prev.map((msg) => {
            if (msg.id === messageId) {
              return { ...msg, is_good: currentMessage.is_good };
            }
            return msg;
          });
        });
        alert(`Failed to save feedback: ${err?.detail || err?.message || err}`);
        return;
      }

      if (response) {
        console.log("✅ [Feedback] Response status updated successfully");
      }
    } catch (e) {
      console.error("❌ [Feedback] Unexpected error:", e);
      // Revert optimistic update on error
      setMessages((prev) => {
        return prev.map((msg) => {
          if (msg.id === messageId) {
            return { ...msg, is_good: currentMessage.is_good };
          }
          return msg;
        });
      });
    }
  };

  /* ---------------------------------------------------------- */
  /* BOOKMARK HANDLER                                          */
  /* ---------------------------------------------------------- */
  const handleBookmark = async (messageId, messageText) => {
    // Find the current message to get its current is_bookmarked status
    const currentMessage = messages.find((msg) => msg.id === messageId);
    if (!currentMessage) {
      console.error("Message not found:", messageId);
      return;
    }

    // Toggle the is_bookmarked status
    const newIsBookmarkedStatus = !currentMessage.is_bookmarked;
    console.log(
      `🔖 [Bookmark] Toggling bookmark for ${messageId}: ${currentMessage.is_bookmarked} → ${newIsBookmarkedStatus}`
    );

    try {
      // Update the local message state immediately (optimistic update)
      setMessages((prev) => {
        return prev.map((msg) => {
          if (msg.id === messageId) {
            return { ...msg, is_bookmarked: newIsBookmarkedStatus };
          }
          return msg;
        });
      });

      // Toggle the bookmark in the database
      const { response, err } = await notificationApi.toggleBookmark(
        sessionId,
        messageId,
        {
          is_bookmarked: newIsBookmarkedStatus,
          title: messageText.substring(0, 100),
          content: messageText,
        }
      );

      if (err) {
        console.error("❌ [Bookmark] Error:", err);
        // Revert optimistic update on error
        setMessages((prev) => {
          return prev.map((msg) => {
            if (msg.id === messageId) {
              return { ...msg, is_bookmarked: currentMessage.is_bookmarked };
            }
            return msg;
          });
        });
        alert(`Failed to bookmark: ${err?.detail || err?.message || err}`);
        return;
      }

      if (response) {
        console.log("✅ [Bookmark] Bookmark status updated successfully");
      }
    } catch (e) {
      console.error("❌ [Bookmark] Unexpected error:", e);
      // Revert optimistic update on error
      setMessages((prev) => {
        return prev.map((msg) => {
          if (msg.id === messageId) {
            return { ...msg, is_bookmarked: currentMessage.is_bookmarked };
          }
          return msg;
        });
      });
    }
  };

  /* ---------------------------------------------------------- */
  /* MORE MENU HANDLERS                                        */
  /* ---------------------------------------------------------- */
  const handleOpenMoreMenu = (event, messageId) => {
    setMoreMenuAnchor(event.currentTarget);
    setSelectedMessageForMenu(messageId);
  };

  const handleCloseMoreMenu = () => {
    setMoreMenuAnchor(null);
    setSelectedMessageForMenu(null);
  };

  const handleReportIssue = () => {
    setReportingMessage(selectedMessageForMenu);
    setReportDialogOpen(true);
    handleCloseMoreMenu();
  };

  const handleShareMessage = async () => {
    const message = messages.find((m) => m.id === selectedMessageForMenu);
    if (!message) return;

    console.log("📤 [Share] Sharing message:", message.text.substring(0, 50));

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Shared from EduWingz",
          text: message.text,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(message.text);
        alert("Message copied to clipboard");
      }
    } catch (e) {
      console.error("Share error:", e);
    }

    handleCloseMoreMenu();
  };

  const handleExportPDF = async () => {
    const message = messages.find((m) => m.id === selectedMessageForMenu);
    if (!message) return;

    console.log("📄 [Export] Exporting as PDF:", message.text.substring(0, 50));

    // Note: You'll need to install a PDF library like jsPDF
    // For now, this is a placeholder
    try {
      const pdfContent = `
Message from EduWingz Chat
Time: ${message.timestamp.toLocaleString()}
Sender: ${message.sender}

${message.text}
      `.trim();

      // Create a simple text-based "export"
      const blob = new Blob([pdfContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `message-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);

      alert("Message exported successfully");
    } catch (e) {
      console.error("Export error:", e);
      alert("Failed to export message");
    }

    handleCloseMoreMenu();
  };

  const handleSubmitReport = async () => {
    if (!reportReason.trim()) {
      alert("Please select a reason");
      return;
    }

    console.log("🚨 [Report] Submitting report for message:", reportingMessage);

    try {
      const { response, err } = await notificationApi.createReport(
        reportingMessage,
        {
          reason: reportReason,
          description: reportDescription,
        }
      );

      if (err) {
        console.error("❌ [Report] Error:", err);
        alert(`Failed to submit report: ${err?.detail || err?.message || err}`);
        return;
      }

      if (response) {
        console.log("✅ [Report] Report submitted successfully");
        alert("Report submitted. Thank you for helping us improve!");
      }
    } catch (e) {
      console.error("❌ [Report] Unexpected error:", e);
    } finally {
      setReportDialogOpen(false);
      setReportReason("");
      setReportDescription("");
      setReportingMessage(null);
    }
  };

  /* ---------------------------------------------------------- */
  /* CONTINUE MESSAGE HANDLER                                  */
  /* ---------------------------------------------------------- */

  /* ---------------------------------------------------------- */
  /* VOICE HANDLER - Generate TTS and play audio               */
  /* ---------------------------------------------------------- */
  const handleVoice = async (text, messageId) => {
    try {
      // Stop current playback if any
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      setActiveVoice(messageId);
      setVoiceLoading(true);

      console.log(
        "🎤 [Voice] Starting speech generation for text:",
        text.substring(0, 50)
      );
      const { response, err } = await chatApi.textToSpeech(text, "English");

      if (err) {
        console.error("❌ [Voice] Error generating speech:", err);
        alert(`Voice generation failed: ${err?.detail || err?.message || err}`);
        setVoiceLoading(false);
        setActiveVoice(null);
        return;
      }

      if (!response) {
        console.error("❌ [Voice] No response from API");
        alert("Voice generation failed: No response from server");
        setVoiceLoading(false);
        setActiveVoice(null);
        return;
      }

      console.log(
        "✅ [Voice] Speech generated successfully, response keys:",
        Object.keys(response)
      );

      // Create audio blob from response
      let audioData = response;

      // If response has a specific audio field
      if (response.audio) {
        console.log(
          "📊 [Voice] Using response.audio field, size:",
          response.audio.length
        );
        audioData = response.audio;
      } else if (response.audio_url) {
        console.log("📊 [Voice] Using response.audio_url field");
        audioData = response.audio_url;
      } else {
        console.warn("⚠️ [Voice] Response structure unexpected:", response);
      }

      // Create audio element or blob URL
      let audioUrl = audioData;
      if (typeof audioData === "string" && !audioData.startsWith("http")) {
        console.log("🔄 [Voice] Converting base64 to blob...");
        try {
          // If it's base64, convert to blob
          const binaryString = atob(audioData);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: "audio/wav" });
          audioUrl = URL.createObjectURL(blob);
          console.log("✅ [Voice] Blob created, URL:", audioUrl);
        } catch (decodeErr) {
          console.error("❌ [Voice] Failed to decode base64:", decodeErr);
          alert(`Failed to process audio: ${decodeErr.message}`);
          setVoiceLoading(false);
          setActiveVoice(null);
          return;
        }
      }

      // Create and play audio
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      console.log("🎵 [Voice] Setting audio source and playing...");
      audioRef.current.src = audioUrl;

      audioRef.current
        .play()
        .then(() => {
          console.log("▶️ [Voice] Audio playing successfully");
          setVoiceLoading(false);
        })
        .catch((playErr) => {
          console.error("❌ [Voice] Error playing audio:", playErr);
          alert(`Failed to play audio: ${playErr.message}`);
          setVoiceLoading(false);
          setActiveVoice(null);
        });

      // Handle audio end
      audioRef.current.onended = () => {
        console.log("⏹️ [Voice] Audio ended");
        setActiveVoice(null);
      };

      // Handle audio error
      audioRef.current.onerror = (e) => {
        console.error("❌ [Voice] Audio playback error:", e);
        setVoiceLoading(false);
        setActiveVoice(null);
      };
    } catch (e) {
      console.error("❌ [Voice] Unexpected error in handleVoice:", e);
      alert(`Voice error: ${e.message}`);
      setVoiceLoading(false);
      setActiveVoice(null);
    }
  };

  /* ---------------------------------------------------------- */
  /* MARKDOWN COMPONENTS (extracted to avoid duplication)     */
  /* ---------------------------------------------------------- */
  const markdownComponents = {
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
              display: "block",
            }}
          >
            <pre style={{ margin: 0 }}>
              <code>{String(children).replace(/\n$/, "")}</code>
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
        sx={{ fontSize: "1.4rem", mt: 1.5, mb: 0.5, display: "block" }}
      >
        {children}
      </Box>
    ),
    h2: ({ children }) => (
      <Box
        component="h2"
        sx={{ fontSize: "1.2rem", mt: 1.2, mb: 0.5, display: "block" }}
      >
        {children}
      </Box>
    ),
    ul: ({ children }) => (
      <Box component="ul" sx={{ pl: 2, my: 1, display: "block" }}>
        {children}
      </Box>
    ),
    ol: ({ children }) => (
      <Box component="ol" sx={{ pl: 2, my: 1, display: "block" }}>
        {children}
      </Box>
    ),
    p: ({ children, ...props }) => (
      <Box component="span" sx={{ display: "inline", m: 0 }} {...props}>
        {children}
      </Box>
    ),
  };

  /* ---------------------------------------------------------- */
  /* UI                                                         */
  /* ---------------------------------------------------------- */
  return (
    <>
      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
      <Container
        sx={{ position: "relative", height: window.innerHeight - 100 }}
      >
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
                  <Box sx={{ maxWidth: "80%" }}>
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
                        width: "auto",
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
                      {message.sender === "bot" ? (
                        <Box sx={{ minHeight: "1.5em" }}>
                          {!animatedMessages.has(message.id) ? (
                            <>
                              {/* Animated Typing Version - Only render this during animation */}
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={markdownComponents}
                              >
                                {animatedTexts[message.id] || ""}
                              </ReactMarkdown>

                              {/* Blinking cursor during typing */}
                              {animatedTexts[message.id] &&
                                animatedTexts[message.id].length <
                                  message.text.length && (
                                  <span
                                    style={{
                                      display: "inline",
                                      marginLeft: "0.25rem",
                                      animation: "blink 0.5s linear infinite",
                                    }}
                                  >
                                    |
                                  </span>
                                )}

                              {/* Hidden TextType to drive animation */}
                              <TextType
                                text={message.text}
                                typingSpeed={70}
                                showCursor={false}
                                loop={false}
                                onSentenceComplete={() =>
                                  handleAnimationComplete(message.id)
                                }
                                onTextUpdate={(text) =>
                                  handleTextUpdate(message.id, text)
                                }
                                style={{ display: "none" }}
                              />
                            </>
                          ) : (
                            /* Static Full Version - Only render this after animation completes */
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={markdownComponents}
                            >
                              {message.text}
                            </ReactMarkdown>
                          )}
                        </Box>
                      ) : (
                        /* User Message */
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={markdownComponents}
                        >
                          {message.text}
                        </ReactMarkdown>
                      )}

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

                      {/* Continue button for incomplete bot messages */}
                      {message.sender === "bot" && message.is_incomplete && (
                        <Box
                          sx={{
                            mt: 1,
                            display: "flex",
                            justifyContent: "flex-start",
                          }}
                        >
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleContinueMessage(message.id)}
                            disabled={isLoading}
                            sx={{
                              textTransform: "none",
                              fontSize: "0.75rem",
                            }}
                          >
                            Continue
                          </Button>
                        </Box>
                      )}
                    </Paper>
                    {message.sender === "user" ? (
                      <>
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
                              <>
                                <Box
                                  sx={{
                                    justifyContent: "right",
                                    display: "flex",
                                  }}
                                  key={attachment.id || attachment.filename}
                                >
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
                                        window.open(
                                          attachment.file_url,
                                          "_blank",
                                          "noopener,noreferrer"
                                        );
                                      }
                                    }}
                                  >
                                    {attachment?.filename?.endsWith(".png") ||
                                    attachment?.filename?.endsWith(".jpg") ||
                                    attachment?.filename?.endsWith(".jpeg") ||
                                    attachment?.filename?.endsWith(".webp") ? (
                                      <Avatar
                                        variant="rounded"
                                        src={attachment.file_url || undefined}
                                        alt={attachment.filename}
                                      >
                                        <ImageOutlinedIcon />
                                      </Avatar>
                                    ) : attachment?.filename?.endsWith(
                                        ".pdf"
                                      ) ? (
                                      <Avatar variant="rounded">
                                        <PictureAsPdfOutlinedIcon />
                                      </Avatar>
                                    ) : (
                                      <Avatar variant="rounded">
                                        <UploadFileOutlinedIcon />
                                      </Avatar>
                                    )}

                                    <Box sx={{}}>
                                      <Typography variant="body2">
                                        {attachment.filename}
                                      </Typography>
                                      {/* <Typography variant="caption" color="text.secondary">
                                  {attachment.id}
                                </Typography> */}
                                    </Box>
                                  </Box>
                                </Box>
                              </>
                            ))}
                          </Box>
                        ) : null}
                      </>
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box sx={{ p: 1 }}>
                          <Tooltip title="Regenerate" arrow>
                            <IconButton
                              onClick={() =>
                                handleRegenerateMessage(message.id)
                              }
                              disabled={isLoading}
                            >
                              <ReplayIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Copy Response" arrow>
                            <IconButton
                              onClick={() =>
                                handleCopy(message.text, message.id)
                              }
                            >
                              {handleCopyMessage &&
                              handleCopyMessageId === message.id ? (
                                <CheckOutlinedIcon sx={{ fontSize: 18 }} />
                              ) : (
                                <ContentCopyIcon sx={{ fontSize: 18 }} />
                              )}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Target Reply" arrow>
                            <IconButton
                              onClick={() => handleTargetReply(message.text)}
                            >
                              <ReplyAllIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Good Response" arrow>
                            <IconButton
                              onClick={() => handleGoodResponse(message.id)}
                            >
                              {message.is_good ? (
                                <FavoriteIcon sx={{ fontSize: 18 }} />
                              ) : (
                                <FavoriteBorderIcon sx={{ fontSize: 18 }} />
                              )}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Add to Bookmarks" arrow>
                            <IconButton
                              onClick={() =>
                                handleBookmark(message.id, message.text)
                              }
                            >
                              {message.is_bookmarked ? (
                                <BookmarksIcon sx={{ fontSize: 18 }} />
                              ) : (
                                <BookmarksOutlinedIcon sx={{ fontSize: 18 }} />
                              )}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Activate Voice" arrow>
                            <Box
                              sx={{
                                position: "relative",
                                display: "inline-block",
                              }}
                            >
                              <IconButton
                                onClick={() =>
                                  handleVoice(message.text, message.id)
                                }
                                disabled={voiceLoading}
                              >
                                {voiceLoading && activeVoice === message.id ? (
                                  <CircularProgress size={18} />
                                ) : (
                                  <VolumeUpIcon sx={{ fontSize: 18 }} />
                                )}
                              </IconButton>
                            </Box>
                          </Tooltip>
                          <Tooltip title="More Options" arrow>
                            <IconButton
                              onClick={(e) => handleOpenMoreMenu(e, message.id)}
                            >
                              <MoreHorizIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        {activeVoice === message.id && !voiceLoading && (
                          <Box
                            sx={{
                              mt: 1,
                              p: 1,
                              borderRadius: 3,
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              fontSize: "0.85rem",
                              border: 1,
                              borderColor: "divider",
                            }}
                          >
                            <VolumeUpIcon sx={{ fontSize: 18 }} />
                            <Typography variant="caption">
                              Voice Active
                            </Typography>
                          </Box>
                        )}
                        {voiceLoading && activeVoice === message.id && (
                          <Box
                            sx={{
                              mt: 1,
                              p: 1,
                              borderRadius: 3,
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              fontSize: "0.85rem",
                              border: 1,
                              borderColor: "divider",
                            }}
                          >
                            <CircularProgress size={16} />
                            <Typography variant="caption">
                              Loading...
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                </ListItem>
              ))}

              {isLoading && (
                <ListItem
                  sx={{
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
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
          quotedMessage={quotedMessage}
          onClearQuote={() => setQuotedMessage(null)}
        />
      </Container>

      {/* More Options Menu */}
      <Menu
        anchorEl={moreMenuAnchor}
        open={Boolean(moreMenuAnchor)}
        onClose={handleCloseMoreMenu}
      >
        <MenuItem onClick={handleShareMessage}>
        <Box sx={{ display: "flex", gap: 1 }}>
            <ShareIcon />
            <Typography>Share Message</Typography>
          </Box></MenuItem>
        <MenuItem onClick={handleExportPDF}>
        <Box sx={{ display: "flex", gap: 1 }}>
            <FileDownloadOutlinedIcon />
            <Typography>Export as File</Typography>
          </Box></MenuItem>
        <MenuItem onClick={handleReportIssue}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <ReportGmailerrorredIcon />
            <Typography>Report Issue</Typography>
          </Box>
        </MenuItem>
      </Menu>

      {/* Report Issue Dialog */}
      <Dialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Report an Issue</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              select
              label="Reason"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              fullWidth
              SelectProps={{
                native: true,
              }}
            >
              <option value="">Select a reason...</option>
              <option value="inappropriate">Inappropriate Content</option>
              <option value="inaccurate">Inaccurate Information</option>
              <option value="offensive">Offensive Language</option>
              <option value="incomplete">Incomplete Response</option>
              <option value="other">Other</option>
            </TextField>
            <TextField
              label="Description"
              multiline
              rows={4}
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Please describe the issue..."
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitReport}
            variant="contained"
            color="error"
          >
            Submit Report
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ChatPage;
