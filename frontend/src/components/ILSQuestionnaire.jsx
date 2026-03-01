import { useState, useRef, useEffect } from "react";
import { Box, Button, Typography, LinearProgress, Paper, IconButton } from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import userApi from "../api/modules/user.api";
import { ilsQuestions } from "../data/ilsQuestions";
import uiConfigs from "../configs/ui.config";

// Generates a random session ID if needed, though they should be authenticated.
// Fallback if session_id is needed for the backend
const generateSessionId = () => {
    return 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

const ILSQuestionnaire = () => {
    const { themeMode } = useSelector((state) => state.themeMode);
    const navigate = useNavigate();

    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [session_id] = useState(generateSessionId());

    // Automatically fetch from user state or local storage if there's an active session
    // But for this simulation, we'll act like we just post to the API

    const question = ilsQuestions[currentQuestionIdx];
    const progress = ((currentQuestionIdx) / ilsQuestions.length) * 100;

    const handleSelect = (value) => {
        const newAnswers = { ...answers, [question.id]: { dimension: question.dimension, value } };
        setAnswers(newAnswers);

        if (currentQuestionIdx < ilsQuestions.length - 1) {
            setTimeout(() => {
                setCurrentQuestionIdx((prev) => prev + 1);
            }, 300); // Small delay for micro-animation effect
        } else {
            submitQuestionnaire(newAnswers);
        }
    };

    const handleBack = () => {
        if (currentQuestionIdx > 0) {
            setCurrentQuestionIdx((prev) => prev - 1);
        }
    };

    const submitQuestionnaire = async (finalAnswers) => {
        setIsSubmitting(true);

        // Calculate dimensions
        const scores = {
            active_reflective: 0,
            sensing_intuitive: 0,
            visual_verbal: 0,
            sequential_global: 0
        };

        Object.values(finalAnswers).forEach((ans) => {
            scores[ans.dimension] += ans.value;
        });

        try {
            // POST the scores to the backend
            const payload = {
                session_id: session_id,
                ...scores
            };

            const res = await fetch('http://localhost:8001/api/learning/questionnaire', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}` // Use token if available
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                throw new Error('Failed to submit questionnaire');
            }

            const data = await res.json();
            console.log('Questionnaire response:', data);

            toast.success("Learning profile generated successfully!", {
                onClose: () => navigate("/main")
            });

        } catch (error) {
            console.error(error);
            toast.error("Failed to submit questionnaire. Please try again.");
            setIsSubmitting(false);
        }
    };

    if (isSubmitting) {
        return (
            <Box sx={{ p: 4, textAlign: 'center', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
                    Analyzing Your Learning Style...
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
                    Our AI is building your personalized learning profile.
                </Typography>
                <LinearProgress sx={{ width: '100%', maxWidth: 400, borderRadius: 2 }} />
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', maxWidth: '800px', mx: 'auto', p: 2 }}>
            {/* Header / Progress */}
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton
                    onClick={handleBack}
                    disabled={currentQuestionIdx === 0}
                    sx={{ opacity: currentQuestionIdx === 0 ? 0.3 : 1 }}
                >
                    <ArrowBackIosNewIcon fontSize="small" />
                </IconButton>
                <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="textSecondary">
                            Question {currentQuestionIdx + 1} of {ilsQuestions.length}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {Math.round(progress)}%
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                            '& .MuiLinearProgress-bar': {
                                background: uiConfigs.style.mainGradient.color
                            }
                        }}
                    />
                </Box>
            </Box>

            {/* Question Card */}
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 3, md: 6 },
                    borderRadius: 4,
                    background: themeMode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    border: '1px solid',
                    borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    backdropFilter: 'blur(10px)',
                    textAlign: 'center',
                    mb: 4
                }}
            >
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 6, lineHeight: 1.4 }}>
                    {question.text}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
                    <Button
                        variant="outlined"
                        onClick={() => handleSelect(question.valueA)}
                        sx={{
                            flex: 1,
                            p: 4,
                            borderRadius: 4,
                            textTransform: 'none',
                            fontSize: '1.1rem',
                            fontWeight: 500,
                            bgcolor: answers[question.id]?.value === question.valueA ? 'primary.main' : 'transparent',
                            color: answers[question.id]?.value === question.valueA ? 'white' : 'text.primary',
                            borderColor: answers[question.id]?.value === question.valueA ? 'primary.main' : 'divider',
                            '&:hover': {
                                bgcolor: answers[question.id]?.value === question.valueA ? 'primary.dark' : 'rgba(25, 118, 210, 0.08)',
                                transform: 'translateY(-2px)'
                            },
                            transition: 'all 0.2s ease-in-out',
                        }}
                    >
                        {question.optionA}
                    </Button>

                    <Button
                        variant="outlined"
                        onClick={() => handleSelect(question.valueB)}
                        sx={{
                            flex: 1,
                            p: 4,
                            borderRadius: 4,
                            textTransform: 'none',
                            fontSize: '1.1rem',
                            fontWeight: 500,
                            bgcolor: answers[question.id]?.value === question.valueB ? 'primary.main' : 'transparent',
                            color: answers[question.id]?.value === question.valueB ? 'white' : 'text.primary',
                            borderColor: answers[question.id]?.value === question.valueB ? 'primary.main' : 'divider',
                            '&:hover': {
                                bgcolor: answers[question.id]?.value === question.valueB ? 'primary.dark' : 'rgba(25, 118, 210, 0.08)',
                                transform: 'translateY(-2px)'
                            },
                            transition: 'all 0.2s ease-in-out',
                        }}
                    >
                        {question.optionB}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default ILSQuestionnaire;
