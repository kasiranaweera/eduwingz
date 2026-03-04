import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    Grid,
    Radio,
    RadioGroup,
    Snackbar,
    Alert,
    Typography,
    Chip,
    Paper,
    IconButton
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import privateClient from "../api/client/private.client";

const PlatformQuiz = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const stateData = location.state || {}; // Expecting { topic, subject, grade, lesson_id }

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

    // Quiz State
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [activeAttemptId, setActiveAttemptId] = useState(null);
    const [questions, setQuestions] = useState([]);

    // User interaction state
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { question_id: option_id }

    // Results state
    const [results, setResults] = useState(null); // the output from submission

    // Config
    const [difficulty, setDifficulty] = useState("medium");

    const generateAdaptiveQuiz = async () => {
        if (!stateData.topic) {
            setSnackbar({ open: true, message: "Missing topic context to generate quiz.", severity: "error" });
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const payload = {
                topic: stateData.topic,
                subject: stateData.subject || "General",
                grade: stateData.grade || "HS",
                base_difficulty: difficulty,
                num_questions: 5,
                lesson_id: stateData.lesson_id
            };

            const response = await privateClient.post("quiz/quizzes/generate_adaptive/", payload);

            setActiveQuiz(response);
            await startQuizAttempt(response.id);

        } catch (err) {
            console.error(err);
            setError("Failed to generate adaptive quiz. The AI service might be busy.");
        } finally {
            setLoading(false);
        }
    };

    const startQuizAttempt = async (quizId) => {
        setLoading(true);
        try {
            const startRes = await privateClient.post(`quiz/quizzes/${quizId}/start/`);
            setActiveAttemptId(startRes.attempt_id);
            setQuestions(startRes.questions || []);
            setCurrentQuestionIndex(0);
            setAnswers({});
            setResults(null);
        } catch (err) {
            console.error(err);
            setError("Failed to start quiz attempt.");
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (questionId, optionId) => {
        setAnswers({ ...answers, [questionId]: optionId });
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleSubmitQuiz = async () => {
        if (Object.keys(answers).length < questions.length) {
            if (!window.confirm("You have unanswered questions. Submit anyway?")) return;
        }

        setLoading(true);
        try {
            const formattedAnswers = Object.entries(answers).map(([qId, optId]) => ({
                question_id: qId,
                selected_option_id: optId
            }));

            const res = await privateClient.post(`quiz/quizzes/${activeQuiz.id}/submit/`, {
                attempt_id: activeAttemptId,
                answers: formattedAnswers,
                time_taken: 0 // Could add a timer later
            });

            setResults(res);
        } catch (err) {
            console.error(err);
            setSnackbar({ open: true, message: "Failed to submit quiz.", severity: "error" });
        } finally {
            setLoading(false);
        }
    };

    const renderGenerationScreen = () => (
        <Box sx={{ textAlign: 'center', py: 8 }}>
            <AutoAwesomeIcon color="primary" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h4" fontWeight={700} gutterBottom>
                Adaptive {stateData.topic || 'Knowledge'} Check
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
                We'll generate a custom quiz tailored to your learning style and current topic.
                The questions and explanations will adapt based on how you interact with the material.
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
                {["easy", "medium", "hard"].map((level) => (
                    <Button
                        key={level}
                        variant={difficulty === level ? "contained" : "outlined"}
                        onClick={() => setDifficulty(level)}
                        sx={{ textTransform: 'capitalize' }}
                    >
                        {level}
                    </Button>
                ))}
            </Box>

            <Button
                variant="contained"
                size="large"
                onClick={generateAdaptiveQuiz}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
            >
                {loading ? "Generating Quiz..." : "Generate My Custom Quiz"}
            </Button>

            {error && (
                <Alert severity="error" sx={{ mt: 4, maxWidth: 600, mx: 'auto' }}>
                    {error}
                </Alert>
            )}
        </Box>
    );

    const renderActiveQuiz = () => {
        const currentQ = questions[currentQuestionIndex];
        if (!currentQ) return null;

        return (
            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" color="text.secondary">
                        Question {currentQuestionIndex + 1} of {questions.length}
                    </Typography>
                    <Chip label={activeQuiz?.difficulty || difficulty} color="primary" variant="outlined" sx={{ textTransform: 'capitalize' }} />
                </Box>

                <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: 1, borderColor: "divider", mb: 4 }}>
                    <Typography variant="h5" fontWeight={600} sx={{ mb: 4 }}>
                        {currentQ.question_text}
                    </Typography>

                    <FormControl component="fieldset" fullWidth>
                        <RadioGroup
                            value={answers[currentQ.id] || ""}
                            onChange={(e) => handleOptionSelect(currentQ.id, e.target.value)}
                        >
                            <Grid container spacing={2}>
                                {currentQ.options.map((opt) => (
                                    <Grid item xs={12} key={opt.id}>
                                        <Card
                                            variant="outlined"
                                            sx={{
                                                cursor: 'pointer',
                                                borderColor: answers[currentQ.id] === opt.id ? "primary.main" : "divider",
                                                bgcolor: answers[currentQ.id] === opt.id ? "action.selected" : "background.paper",
                                                transition: 'all 0.2s',
                                                "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" }
                                            }}
                                            onClick={() => handleOptionSelect(currentQ.id, opt.id)}
                                        >
                                            <CardContent sx={{ '&:last-child': { pb: 2 }, display: 'flex', alignItems: 'center' }}>
                                                <FormControlLabel
                                                    value={opt.id}
                                                    control={<Radio color="primary" />}
                                                    label={<Typography variant="body1">{opt.text}</Typography>}
                                                    sx={{ m: 0, width: '100%' }}
                                                />
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </RadioGroup>
                    </FormControl>
                </Paper>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                        variant="outlined"
                        onClick={handlePrev}
                        disabled={currentQuestionIndex === 0}
                    >
                        Previous
                    </Button>

                    {currentQuestionIndex === questions.length - 1 ? (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmitQuiz}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : "Submit Quiz"}
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={handleNext}
                        >
                            Next
                        </Button>
                    )}
                </Box>
            </Box>
        );
    };

    const renderResults = () => {
        const scorePct = results.score;
        let feedback = "Good effort!";
        if (scorePct >= 80) feedback = "Excellent work!";
        else if (scorePct < 50) feedback = "Keep reviewing, you'll get there!";

        return (
            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: 1, borderColor: "divider", mb: 4, textAlign: 'center' }}>
                    <Typography variant="h3" fontWeight={800} color={scorePct >= 70 ? "success.main" : "warning.main"} gutterBottom>
                        {scorePct}%
                    </Typography>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        {results.correct_answers} out of {results.total_questions} correct
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        {feedback}
                    </Typography>
                </Paper>

                <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
                    Review
                </Typography>

                {results.results?.map((res, idx) => (
                    <Paper key={res.question_id} elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: 1, borderColor: "divider" }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                            {res.is_correct ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
                            <Box>
                                <Typography variant="body1" fontWeight={600}>
                                    {idx + 1}. {res.question_text}
                                </Typography>
                            </Box>
                        </Box>

                        {!res.is_correct && (
                            <Box sx={{ ml: 5, mb: 2 }}>
                                <Typography variant="body2" color="error.main">
                                    Your answer was incorrect.
                                </Typography>
                            </Box>
                        )}

                        <Box sx={{ ml: 5, p: 2, bgcolor: "action.hover", borderRadius: 2 }}>
                            <Typography variant="body2" fontWeight={600} gutterBottom>
                                Correct Answer: {res.correct_option_text}
                            </Typography>
                            {res.explanation && (
                                <>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        {res.explanation}
                                    </Typography>
                                </>
                            )}
                        </Box>
                    </Paper>
                ))}

                <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Button variant="contained" size="large" onClick={() => navigate(-1)}>
                        Return to Lesson
                    </Button>
                </Box>
            </Box>
        );
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh" }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" fontWeight={700}>
                    Adaptive Quiz
                </Typography>
            </Box>

            {results ? renderResults() : (activeQuiz && activeAttemptId) ? renderActiveQuiz() : renderGenerationScreen()}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default PlatformQuiz;
