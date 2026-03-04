import { useState } from "react";
import { Box, Button, Typography, LinearProgress, Paper, IconButton } from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import fastApiClient from "../api/client/fastapi.client";

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
        const newAnswers = { ...answers, [question.id]: { dimension: question.dimension, value: parseInt(value) } };
        setAnswers(newAnswers);

        if (currentQuestionIdx < ilsQuestions.length - 1) {
            setTimeout(() => {
                setCurrentQuestionIdx((prev) => prev + 1);
            }, 500); // Slightly longer delay for Likert experience
        }
    };

    const handleNext = () => {
        if (answers[question.id]) {
            if (currentQuestionIdx < ilsQuestions.length - 1) {
                setCurrentQuestionIdx((prev) => prev + 1);
            } else {
                submitQuestionnaire(answers);
            }
        } else {
            toast.warning("Please select an answer before proceeding.");
        }
    };

    const handleBack = () => {
        if (currentQuestionIdx > 0) {
            setCurrentQuestionIdx((prev) => prev - 1);
        }
    };

    const submitQuestionnaire = async (finalAnswers) => {
        setIsSubmitting(true);

        // Group answers by dimension
        const dimensionGroups = {
            active_reflective: [],
            sensing_intuitive: [],
            visual_verbal: [],
            sequential_global: []
        };

        Object.values(finalAnswers).forEach((ans) => {
            dimensionGroups[ans.dimension].push(ans.value);
        });

        // Calculate normalized scores: (sum - min) / (max - min)
        // With 11 questions per dimension, min=11 (all 1s), max=55 (all 5s)
        const scores = {};
        Object.entries(dimensionGroups).forEach(([dim, vals]) => {
            const sum = vals.reduce((a, b) => a + b, 0);
            // If some questions weren't answered for some reason, handle fallback
            const count = vals.length || 11;
            const minPossible = count * 1;
            const maxPossible = count * 5;
            scores[dim] = (sum - minPossible) / (maxPossible - minPossible);
        });

        try {
            // POST the scores to the backend using privateClient for proper token handling
            const payload = {
                session_id: session_id,
                ...scores
            };

            const response = await fastApiClient.post('/api/learning/questionnaire', payload);

            console.log('Questionnaire response:', response);

            toast.success("Learning profile generated successfully!", {
                onClose: () => navigate("/main")
            });

        } catch (error) {
            console.error("❌ [ILS] Questionnaire submission error:", error);
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

                <Box sx={{ mb: 6 }}>
                    <Typography variant="body1" sx={{ color: 'text.secondary', fontStyle: 'italic', mb: 3 }}>
                        Choose the position that best represents your preference between:
                    </Typography>

                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: { xs: 2, md: 4 }
                    }}>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                flex: 1,
                                textAlign: { xs: 'center', md: 'right' },
                                fontWeight: 700,
                                color: themeMode === 'dark' ? 'primary.light' : 'primary.main',
                                minWidth: { md: '180px' }
                            }}
                        >
                            (a) {question.optionA}
                        </Typography>

                        <Box sx={{
                            display: 'flex',
                            gap: { xs: 1, sm: 2 },
                            bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                            p: 2,
                            borderRadius: 10,
                            border: '1px solid',
                            borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                        }}>
                            {[1, 2, 3, 4, 5].map((val) => (
                                <IconButton
                                    key={val}
                                    onClick={() => handleSelect(val)}
                                    sx={{
                                        width: { xs: 40, sm: 50 },
                                        height: { xs: 40, sm: 50 },
                                        fontSize: '1.2rem',
                                        fontWeight: 800,
                                        transition: 'all 0.2s',
                                        bgcolor: answers[question.id]?.value === val ? 'primary.main' : 'transparent',
                                        color: answers[question.id]?.value === val ? 'white' : 'text.primary',
                                        border: '2px solid',
                                        borderColor: answers[question.id]?.value === val ? 'primary.main' : 'divider',
                                        '&:hover': {
                                            bgcolor: answers[question.id]?.value === val ? 'primary.dark' : 'rgba(25, 118, 210, 0.1)',
                                            transform: 'scale(1.1)'
                                        }
                                    }}
                                >
                                    {val}
                                </IconButton>
                            ))}
                        </Box>

                        <Typography
                            variant="subtitle1"
                            sx={{
                                flex: 1,
                                textAlign: { xs: 'center', md: 'left' },
                                fontWeight: 700,
                                color: themeMode === 'dark' ? 'primary.light' : 'primary.main',
                                minWidth: { md: '180px' }
                            }}
                        >
                            (b) {question.optionB}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Button
                        variant="contained"
                        onClick={handleNext}
                        disabled={!answers[question.id]}
                        sx={{
                            px: 8,
                            py: 1.5,
                            borderRadius: 8,
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            background: uiConfigs.style.mainGradient.color,
                            color: 'white',
                            '&:disabled': {
                                opacity: 0.5,
                                background: 'grey'
                            }
                        }}
                    >
                        {currentQuestionIdx === ilsQuestions.length - 1 ? "Finish & Generate Profile" : "Next Question"}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default ILSQuestionnaire;
