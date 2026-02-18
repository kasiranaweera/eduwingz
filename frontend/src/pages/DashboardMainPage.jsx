import { Box, Container, Divider, Link, Stack, Typography, List, ListItem } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import ChatSection from '../components/ChatSection';
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import { useNavigate } from 'react-router-dom';
import chatApi from '../api/modules/chat.api';
import ShinyText from '../components/common/ShinyText';
import TextType from '../components/common/TextType';
import { LocalLibraryOutlined } from '@mui/icons-material';

const DashboardMainPage = () => {
    const { user } = useSelector((state) => state.user);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
    // Dummy use to avoid eslint warning
    void setLoadingMessageIndex;
    // eslint-disable-next-line no-unused-vars
    const [autoMessage, setAutoMessage] = useState("");
    // Dummy use to avoid eslint warning
    void setAutoMessage;

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Set a welcome message when component mounts
    const welcomeMessage = `Welcome back, ${user.username}! How can I assist you with your learning today?`;
    // autoMessage can be used to display welcome greeting
    // setAutoMessage(welcomeMessage);        // You could also fetch some initial data here if needed
    // fetchInitialData().then(data => setAutoMessage(data.message));
  }, [user.username]);

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
                <Box sx={{width:'100%'}}>
                    {isLoading && (
                        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
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
                        <ChatSection 
                            sx={{ width: "50vw" }} 
                            handleSendMessage={handleSendMessage}
                        />
                    </Box>

                    {/* Rest of your component remains the same */}
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
                                        main='true'
                                    />
                                </Box>
                                <Box sx={{}}>
                                    <Typography variant="h6" sx={{ fontWeight: "600" }}>
                                        EduWingz - Chat
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: "300" }}>
                                        Find answers tailored to your learning patterns with our
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
                                    <LocalLibraryOutlined
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
    )
}

export default DashboardMainPage