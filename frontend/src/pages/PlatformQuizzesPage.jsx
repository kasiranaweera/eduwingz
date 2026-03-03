import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  CircularProgress,
  Menu,
  MenuItem,
  LinearProgress,
  Alert,
  Snackbar,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SchoolIcon from "@mui/icons-material/School";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TimerIcon from "@mui/icons-material/Timer";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import lessonsApi from "../api/modules/lessons.api";
import { toast } from "react-toastify";



const PlatformQuizzesPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, completed, pending
  const [openNewQuiz, setOpenNewQuiz] = useState(false);
  const [openTakeQuiz, setOpenTakeQuiz] = useState(false);
  const [openQuizResults, setOpenQuizResults] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizResults, setQuizResults] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [newQuizData, setNewQuizData] = useState({
    title: "",
    description: "",
    category: "general",
    timeLimit: 30,
  });

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const { response, err } = await lessonsApi.getQuizzes();
      if (response && !err) {
        // Map backend response format to frontend expected format
        const fetchedQuizzes = response.map(q => ({
          ...q,
          questions: q.question_count || 0,
          completed: q.attempt_count > 0,
          attempts: q.attempt_count || 0,
          bestScore: q.best_attempt,
          lastAttempt: q.attempt_count > 0 ? "Previously" : "Never",
          questions_data: q.questions || []
        }));
        setQuizzes(fetchedQuizzes);
      } else {
        toast.error("Failed to load quizzes");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error loading quizzes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  // Filter quizzes
  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "completed" && quiz.completed) ||
      (filterStatus === "pending" && !quiz.completed);

    return matchesSearch && matchesStatus;
  });

  const handleCreateQuiz = () => {
    toast.info("Quiz creation requires AI generator backend (Coming Soon!)");
    setOpenNewQuiz(false);
  };

  const handleDeleteQuiz = (quizId) => {
    setQuizzes(quizzes.filter((q) => q.id !== quizId));
    setSnackbar({
      open: true,
      message: "Quiz deleted",
      severity: "success",
    });
    handleCloseMenu();
  };

  const handleStartQuiz = (quizId) => {
    setSelectedQuizId(quizId);
    setCurrentQuizIndex(0);
    setUserAnswers({});
    setShowHint(false);
    setOpenTakeQuiz(true);
  };

  const handleOpenMenu = (e, quizId) => {
    setAnchorEl(e.currentTarget);
    setSelectedQuizId(quizId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedQuizId(null);
  };

  const handleAnswerQuestion = (questionId, answer) => {
    setUserAnswers({
      ...userAnswers,
      [questionId]: answer,
    });
  };

  const handleSubmitQuiz = async () => {
    const quiz = quizzes.find((q) => q.id === selectedQuizId);
    let correctCount = 0;

    quiz.questions_data.forEach((question) => {
      // Find the ID of the option that is marked correct
      const correctOptionIndex = question.options.findIndex((opt) => opt.is_correct);
      // userAnswers stores the index of the selected option
      if (userAnswers[question.id] === correctOptionIndex) {
        correctCount++;
      }
    });

    const score = quiz.questions_data.length > 0
      ? Math.round((correctCount / quiz.questions_data.length) * 100)
      : 0;

    const timeSpent = Math.floor(Math.random() * (quiz.timeLimit - 5)) + 5; // Mock time spent

    setQuizResults({
      quizTitle: quiz.title,
      totalQuestions: quiz.questions_data.length,
      correctAnswers: correctCount,
      score: score,
      timeSpent: timeSpent,
    });

    // Submit to backend
    try {
      const { err } = await lessonsApi.submitQuiz(quiz.id, {
        score: score,
        total_questions: quiz.questions_data.length,
        correct_answers: correctCount,
        time_taken: timeSpent * 60, // backend expects seconds
      });

      if (err) {
        toast.error("Failed to save quiz score");
      } else {
        toast.success("Quiz completed successfully!");
        // Reload quizzes to update scores
        loadQuizzes();
      }
    } catch (e) {
      toast.error("Error saving quiz score");
    }

    setOpenTakeQuiz(false);
    setOpenQuizResults(true);
  };

  const QuizCard = ({ quiz }) => (
    <Card elevation={0} sx={{ border: 1, borderColor: "divider", height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "start", gap: 1, flex: 1 }}>
            <SchoolIcon sx={{ color: "primary.main", mt: 0.5 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {quiz.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {quiz.category}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={(e) => handleOpenMenu(e, quiz.id)}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {quiz.description}
        </Typography>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
          <Chip
            size="small"
            icon={<TimerIcon fontSize="small" />}
            label={`${quiz.timeLimit} min`}
            variant="outlined"
          />
          <Chip
            size="small"
            label={`${quiz.questions} Q`}
            variant="outlined"
          />
          <Chip
            size="small"
            label={quiz.difficulty}
            color={
              quiz.difficulty === "Easy"
                ? "success"
                : quiz.difficulty === "Medium"
                  ? "warning"
                  : "error"
            }
            variant="filled"
          />
        </Box>

        {quiz.completed && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                Best Score
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {quiz.bestScore}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={quiz.bestScore}
              sx={{ height: 8, borderRadius: 1 }}
            />
          </Box>
        )}

        <Box sx={{ display: "flex", gap: 1, alignItems: "center", pt: 1, borderTop: 1, borderColor: "divider" }}>
          {quiz.completed ? (
            <>
              <CheckCircleIcon fontSize="small" sx={{ color: "success.main" }} />
              <Typography variant="caption" color="text.secondary">
                {quiz.attempts} attempt{quiz.attempts !== 1 ? "s" : ""} • {quiz.lastAttempt}
              </Typography>
            </>
          ) : (
            <>
              <TrendingUpIcon fontSize="small" sx={{ color: "info.main" }} />
              <Typography variant="caption" color="text.secondary">
                Not attempted yet
              </Typography>
            </>
          )}
        </Box>
      </CardContent>

      <Divider />

      <CardActions>
        <Button
          fullWidth
          variant={quiz.completed ? "outlined" : "contained"}
          startIcon={<PlayArrowIcon />}
          onClick={() => handleStartQuiz(quiz.id)}
        >
          {quiz.completed ? "Retake Quiz" : "Start Quiz"}
        </Button>
      </CardActions>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Quizzes
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenNewQuiz(true)}
          >
            Create Quiz
          </Button>
        </Box>

        {/* Search and Filters */}
        <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
          <TextField
            placeholder="Search quizzes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, minWidth: 250 }}
          />
        </Box>

        {/* Status Filter */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Chip
            label={`All (${quizzes.length})`}
            onClick={() => setFilterStatus("all")}
            variant={filterStatus === "all" ? "filled" : "outlined"}
            color={filterStatus === "all" ? "primary" : "default"}
          />
          <Chip
            label={`Completed (${quizzes.filter((q) => q.completed).length})`}
            onClick={() => setFilterStatus("completed")}
            variant={filterStatus === "completed" ? "filled" : "outlined"}
            color={filterStatus === "completed" ? "primary" : "default"}
            icon={filterStatus === "completed" ? <CheckCircleIcon /> : undefined}
          />
          <Chip
            label={`Not Started (${quizzes.filter((q) => !q.completed).length})`}
            onClick={() => setFilterStatus("pending")}
            variant={filterStatus === "pending" ? "filled" : "outlined"}
            color={filterStatus === "pending" ? "primary" : "default"}
          />
        </Box>
      </Box>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredQuizzes.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <Typography color="text.secondary" variant="h6" sx={{ mb: 1 }}>
            {searchQuery ? "No quizzes match your search" : "No quizzes available"}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {searchQuery
              ? "Try adjusting your search terms"
              : "Create your first quiz to get started"}
          </Typography>
          {!searchQuery && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenNewQuiz(true)}
            >
              Create Quiz
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {filteredQuizzes.map((quiz) => (
            <Grid item xs={12} sm={6} md={4} key={quiz.id}>
              <QuizCard quiz={quiz} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Quiz Dialog */}
      <Dialog open={openNewQuiz} onClose={() => setOpenNewQuiz(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create a New Quiz</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Quiz Title"
            placeholder="Enter quiz title..."
            value={newQuizData.title}
            onChange={(e) =>
              setNewQuizData({ ...newQuizData, title: e.target.value })
            }
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Description"
            placeholder="Brief description of the quiz..."
            value={newQuizData.description}
            onChange={(e) =>
              setNewQuizData({ ...newQuizData, description: e.target.value })
            }
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Category"
            placeholder="e.g., Mathematics, Science..."
            value={newQuizData.category}
            onChange={(e) =>
              setNewQuizData({ ...newQuizData, category: e.target.value })
            }
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            type="number"
            label="Time Limit (minutes)"
            value={newQuizData.timeLimit}
            onChange={(e) =>
              setNewQuizData({
                ...newQuizData,
                timeLimit: parseInt(e.target.value) || 30,
              })
            }
          />
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenNewQuiz(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleCreateQuiz}
            variant="contained"
            disabled={!newQuizData.title.trim()}
          >
            Create Quiz
          </Button>
        </DialogActions>
      </Dialog>

      {/* Take Quiz Dialog */}
      {selectedQuizId && (
        <Dialog open={openTakeQuiz} onClose={() => setOpenTakeQuiz(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {quizzes.find((q) => q.id === selectedQuizId)?.title}
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 2 }}>
            {quizzes.find((q) => q.id === selectedQuizId)?.questions_data[currentQuizIndex] && (
              <Box>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="body2">
                      Question {currentQuizIndex + 1} of{" "}
                      {quizzes.find((q) => q.id === selectedQuizId)?.questions_data
                        .length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Progress
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={
                      ((currentQuizIndex + 1) /
                        quizzes.find((q) => q.id === selectedQuizId)?.questions_data
                          .length) *
                      100
                    }
                  />
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {quizzes.find((q) => q.id === selectedQuizId)?.questions_data[
                      currentQuizIndex
                    ]?.question}
                  </Typography>
                  {quizzes.find((q) => q.id === selectedQuizId)?.questions_data[currentQuizIndex]?.explanation && (
                    <Button
                      size="small"
                      onClick={() => setShowHint(!showHint)}
                      sx={{ minWidth: "auto", textTransform: "none" }}
                    >
                      {showHint ? "Hide Hint" : "💡 Need a hint?"}
                    </Button>
                  )}
                </Box>

                <Collapse in={showHint}>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    {/* The explanation acts as a hint/reasoning */}
                    {quizzes.find((q) => q.id === selectedQuizId)?.questions_data[currentQuizIndex]?.explanation}
                  </Alert>
                </Collapse>

                <FormControl fullWidth>
                  <RadioGroup
                    value={
                      userAnswers[
                      quizzes.find((q) => q.id === selectedQuizId)
                        ?.questions_data[currentQuizIndex]?.id
                      ] ?? ""
                    }
                    onChange={(e) =>
                      handleAnswerQuestion(
                        quizzes.find((q) => q.id === selectedQuizId)
                          ?.questions_data[currentQuizIndex]?.id,
                        parseInt(e.target.value)
                      )
                    }
                  >
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {quizzes
                        .find((q) => q.id === selectedQuizId)
                        ?.questions_data[currentQuizIndex]?.options.map(
                          (option, idx) => (
                            <FormControlLabel
                              key={idx}
                              value={idx}
                              control={<Radio />}
                              label={option}
                              sx={{
                                border: 1,
                                borderColor: "divider",
                                p: 1.5,
                                borderRadius: 1,
                                "&:hover": {
                                  bgcolor: "action.hover",
                                },
                              }}
                            />
                          )
                        )}
                    </Box>
                  </RadioGroup>
                </FormControl>
              </Box>
            )}
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => {
                if (currentQuizIndex > 0) {
                  setCurrentQuizIndex(currentQuizIndex - 1);
                }
              }}
              disabled={currentQuizIndex === 0}
              variant="outlined"
            >
              Previous
            </Button>
            <Box sx={{ flex: 1 }} />
            {currentQuizIndex <
              quizzes.find((q) => q.id === selectedQuizId)?.questions_data
                .length -
              1 ? (
              <Button
                onClick={() => {
                  setCurrentQuizIndex(currentQuizIndex + 1);
                  setShowHint(false);
                }}
                variant="contained"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmitQuiz}
                variant="contained"
                color="success"
              >
                Submit Quiz
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}

      {/* Quiz Results Dialog */}
      <Dialog open={openQuizResults} onClose={() => setOpenQuizResults(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Quiz Completed!</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3, textAlign: "center" }}>
          {quizResults && (
            <Box>
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  bgcolor: quizResults.score >= 70 ? "success.main" : "warning.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 2,
                }}
              >
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 700, color: "white" }}
                >
                  {quizResults.score}%
                </Typography>
              </Box>

              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                {quizResults.quizTitle}
              </Typography>

              <Box sx={{ mb: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2">Correct Answers</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {quizResults.correctAnswers}/{quizResults.totalQuestions}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Time Spent</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {quizResults.timeSpent} minutes
                  </Typography>
                </Box>
              </Box>

              <Alert
                severity={
                  quizResults.score >= 70 ? "success" : "info"
                }
              >
                {quizResults.score >= 70
                  ? "Great job! Keep up the excellent work!"
                  : "Good effort! Review the topics and try again."}
              </Alert>
            </Box>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenQuizResults(false)} variant="outlined">
            Close
          </Button>
          <Button
            onClick={() => {
              setOpenQuizResults(false);
              handleStartQuiz(selectedQuizId);
            }}
            variant="contained"
          >
            Retake Quiz
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quiz Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem
          onClick={() => {
            handleCloseMenu();
          }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            handleDeleteQuiz(selectedQuizId);
          }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1, color: "error.main" }} />
          <Typography color="error">Delete</Typography>
        </MenuItem>
      </Menu>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default PlatformQuizzesPage;
