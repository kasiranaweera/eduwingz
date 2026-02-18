import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Skeleton,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  LinearProgress,
  TextField,
} from "@mui/material";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import uiConfigs from "../configs/ui.config";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import lessonsApi from "../api/modules/lessons.api";
import lessonGeneratorData from "../assets/data/lessonGeneratorData.json";

const PlatformLessons = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subjectLessons, setSubjectLessons] = useState({});
  const [loading, setLoading] = useState(true);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openGenerateDialog, setOpenGenerateDialog] = useState(false);
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingMessage, setGeneratingMessage] = useState("");
  const [markedDates, setMarkedDates] = useState([]);

  // Get subjects for selected grade
  const getSubjectsForGrade = () => {
    if (!grade) return [];
    const selectedGrade = lessonGeneratorData.grades.find(
      (g) => g.value === grade
    );
    return selectedGrade ? selectedGrade.subjects : [];
  };

  // Get topics for selected subject
  const getTopicsForSubject = () => {
    if (!grade || !subject) return [];
    const selectedGrade = lessonGeneratorData.grades.find(
      (g) => g.value === grade
    );
    if (!selectedGrade) return [];
    const selectedSubjectObj = selectedGrade.subjects.find(
      (s) => s.value === subject
    );
    return selectedSubjectObj ? selectedSubjectObj.topics : [];
  };

  const { user } = useSelector((state) => state.user);

  // Fetch lessons and subjects when user is available
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setSubjectsLoading(true);

        // Fetch lessons
        const { response: lessonsResponse, err: lessonsErr } =
          await lessonsApi.listLessons();
        if (lessonsErr) {
          setError("Failed to load lessons");
          setSnackbar({
            open: true,
            message: "Failed to load lessons",
            severity: "error",
          });
        } else {
          setLessons(lessonsResponse || []);
          setError(null);
        }

        // Fetch subjects
        const { response: subjectsResponse, err: subjectsErr } =
          await lessonsApi.getSubjects();
        if (subjectsErr) {
          console.error("Failed to load subjects");
        } else {
          setSubjects(subjectsResponse || []);
        }

        setSubjectsLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("An error occurred while loading data");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    } else {
      setLessons([]);
      setSubjects([]);
      setLoading(false);
      setSubjectsLoading(false);
    }
  }, [user]);

  const handleGenerateLesson = async () => {
    const finalTopic = customTopic || topic;
    
    if (!grade || !subject || !finalTopic) {
      setSnackbar({
        open: true,
        message: "Please select all fields or enter a custom topic",
        severity: "warning",
      });
      return;
    }

    try {
      // Create the lesson first
      const { response: lessonResponse, err: lessonErr } = await lessonsApi.createSession({
        title: `${subject}: ${finalTopic} (Grade ${grade})`,
        description: `Grade ${grade} - ${subject} - ${finalTopic}`,
      });

      if (lessonErr) {
        setSnackbar({
          open: true,
          message: "Failed to create lesson",
          severity: "error",
        });
        return;
      }

      // Show loading dialog
      setIsGenerating(true);
      setGeneratingMessage(`Generating ${finalTopic} lesson for ${subject} (Grade ${grade})...`);
      setOpenGenerateDialog(false);

      // Call generate lesson API to create topics
      const { response: generateResponse, err: generateErr } = await lessonsApi.generateLesson({
        grade: grade,
        subject: subject,
        topic: finalTopic,
        lesson_id: lessonResponse.id,
        lesson_type: topic ? "default" : "custom", // 'default' if from menu, 'custom' if typed
      });

      if (generateErr) {
        setIsGenerating(false);
        setSnackbar({
          open: true,
          message: "Failed to generate lesson content",
          severity: "error",
        });
        return;
      }

      // Topics have been created on backend
      const topicsCreated = generateResponse?.topics?.length || 0;

      // Show success after a brief moment
      setTimeout(() => {
        setIsGenerating(false);

        setSnackbar({
          open: true,
          message: `Lesson created successfully with ${topicsCreated} topics!`,
          severity: "success",
        });

        // Add new lesson to list
        setLessons([lessonResponse, ...lessons]);

        // Clear form
        setGrade("");
        setSubject("");
        setTopic("");
        setCustomTopic("");

        // Navigate to the new lesson
        setTimeout(() => {
          navigate(`/dashboard/platform/lessons/${lessonResponse.id}`);
        }, 1000);
      }, 2000);
    } catch (err) {
      console.error("Error generating lesson:", err);
      setIsGenerating(false);
      setSnackbar({
        open: true,
        message: "Error creating lesson",
        severity: "error",
      });
    }
  };

  const handleLessonClick = (lessonId) => {
    navigate(`/dashboard/platform/lessons/${lessonId}`);
  };

  const handleOpenSubjectDialog = async (subj) => {
    setSelectedSubject(subj);

    // Check if we already fetched lessons for this subject
    if (!subjectLessons[subj.id]) {
      try {
        const { response, err } = await lessonsApi.getSubjectLessons(subj.id);
        if (!err && response) {
          setSubjectLessons({
            ...subjectLessons,
            [subj.id]: response,
          });
        }
      } catch (err) {
        console.error("Error fetching subject lessons:", err);
      }
    }

    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSubject(null);
  };

  console.log("subjects", subjects);

  return (
    <>
      <Box>
        <Typography variant="h5">My Lessons</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Grid sx={{ mt: 2 }} container spacing={3}>
        <Grid size={9} spacing={3} container direction="column">
          {/* Recent Lessons */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: 1,
              borderColor: "graycolor.two",
              borderRadius: 3,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">Recent Lessons</Typography>
            </Box>

            {loading ? (
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                {[1, 2, 3, 4].map((i) => (
                  <Box key={i} sx={{ width: "100%" }}>
                    <Skeleton
                      variant="rectangular"
                      height={140}
                      sx={{ borderRadius: 2, mb: 1 }}
                    />
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="text" width="60%" />
                  </Box>
                ))}
              </Box>
            ) : lessons.length === 0 ? (
              <Typography variant="body2" sx={{ mt: 2, opacity: 0.7 }}>
                No lessons yet. Create one to get started!
              </Typography>
            ) : (
              <Box
                sx={{
                  mt: 2,
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 2,
                }}
              >
                {lessons.slice(0, 4).map((lesson) => (
                  <Card
                    key={lesson.id}
                    onClick={() => handleLessonClick(lesson.id)}
                    sx={{
                      cursor: "pointer",
                      border: 1,
                      borderRadius: 3,
                      borderColor: "graycolor.two",
                      backgroundColor: "background.paper",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.05)",
                        boxShadow: 3,
                      },
                    }}
                  >
                    <CardContent sx={{}}>
                      <Typography variant="body1" title={lesson.title}>
                        {lesson.title}
                      </Typography>
                      <Box sx={{ gap: 1, display: "flex", mt: 1 }}>
                        {lesson.subject_name && (
                          <Chip
                            label={lesson.subject_name}
                            size="small"
                            variant="outlined"
                          />
                        )}
                        <Chip
                          label={`${lesson.topics_count || 0} ${
                            lesson.topics_count === 1 ? "Topic" : "Topics"
                          }`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>

                      <Button
                        size="small"
                        fullWidth
                        endIcon={<ArrowRightAltIcon fontSize="small" />}
                        sx={{
                          textTransform: "none",
                          color: "primary.contrastText",
                          border: 1,
                          borderRadius: 3,
                          borderColor: "divider",
                          mt: 2,
                        }}
                      >
                        Open
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>

          {/* Subjects Grid */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: 1,
              borderColor: "graycolor.two",
              borderRadius: 3,
            }}
          >
            <Typography variant="h6">Subjects ({subjects.length})</Typography>

            {subjectsLoading ? (
              <Box
                sx={{
                  mt: 2,
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: 2,
                }}
              >
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton
                    key={i}
                    variant="rectangular"
                    height={120}
                    sx={{ borderRadius: 2 }}
                  />
                ))}
              </Box>
            ) : subjects.length === 0 ? (
              <Typography variant="body2" sx={{ mt: 2, opacity: 0.7 }}>
                No subjects available yet.
              </Typography>
            ) : (
              <Box
                sx={{
                  mt: 2,
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: 2,
                }}
              >
                {subjects.map((subj) => (
                  <Card
                    key={subj.id}
                    sx={{
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.05)",
                        boxShadow: 3,
                      },
                      border: 1,
                      borderRadius: 3,
                      borderColor: "graycolor.two",
                      backgroundColor: "background.paper",
                    }}
                    onClick={() => handleOpenSubjectDialog(subj)}
                  >
                    <CardContent>
                      <Typography variant="body1" noWrap title={subj.name}>
                        {subj.name}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          mt: 1,
                          gap:1
                        }}
                      >
                        {subj.grade_name && (
                          <Chip
                            label={subj.grade_name}
                            size="small"
                            variant="outlined"
                          />
                        )}
                        <Chip
                          label={`${subjects.length || 0} ${
                            subjects.length === 1 ? "Topic" : "Topics"
                          }`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>

          {/* All Lessons */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: 1,
              borderColor: "graycolor.two",
              borderRadius: 3,
            }}
          >
            <Typography variant="h6">All Lessons ({lessons.length})</Typography>

            {loading ? (
              <Box sx={{ mt: 2 }}>
                {[1, 2, 3].map((i) => (
                  <Skeleton
                    key={i}
                    variant="rectangular"
                    height={60}
                    sx={{ mb: 1, borderRadius: 1 }}
                  />
                ))}
              </Box>
            ) : lessons.length === 0 ? (
              <Typography variant="body2" sx={{ mt: 2, opacity: 0.7 }}>
                No lessons found. Create your first lesson!
              </Typography>
            ) : (
              <Box
                sx={{
                  mt: 2,
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 2,
                }}
              >
                {lessons.map((lesson) => (
                  <Card
                    key={lesson.id}
                    onClick={() => handleLessonClick(lesson.id)}
                    sx={{
                      cursor: "pointer",
                      border: 1,
                      borderRadius: 3,
                      borderColor: "graycolor.two",
                      backgroundColor: "background.paper",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.05)",
                        boxShadow: 3,
                      },
                    }}
                  >
                    <CardContent sx={{}}>
                      <Typography variant="body1" title={lesson.title}>
                        {lesson.title}
                      </Typography>
                      <Box sx={{ gap: 1, display: "flex", mt: 1 }}>
                        {lesson.subject_name && (
                          <Chip
                            label={lesson.subject_name}
                            size="small"
                            variant="outlined"
                          />
                        )}
                        <Chip
                          label={`${lesson.topics_count || 0} ${
                            lesson.topics_count === 1 ? "Topic" : "Topics"
                          }`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>

                      <Button
                        size="small"
                        fullWidth
                        endIcon={<ArrowRightAltIcon fontSize="small" />}
                        sx={{
                          textTransform: "none",
                          color: "primary.contrastText",
                          border: 1,
                          borderRadius: 3,
                          borderColor: "divider",
                          mt: 2,
                        }}
                      >
                        Open
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Sidebar - Generate New Lesson & Today's Goals */}
        <Grid item size={3}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              position: "sticky",
              top: 20,
            }}
          >
            {/* Generate New Lesson Button */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: 1,
                borderColor: "graycolor.two",
                borderRadius: 3,
              }}
            >
              <Box
                onClick={() => setOpenGenerateDialog(true)}
                sx={{
                  p: 3,
                  border: 1,
                  borderColor: "graycolor.two",
                  borderRadius: 3,
                  textAlign: "center",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    cursor: "pointer",
                    background: uiConfigs.style.mainGradient.color,
                    color: "secondary.contrastText",
                    transform: "scale(1.02)",
                  },
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: 48 }} />
                <Typography sx={{ mt: 1, fontWeight: 600 }}>
                  Generate New Lesson
                </Typography>
              </Box>
            </Paper>

            {/* Today's Goals Section */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: 1,
                borderColor: "graycolor.two",
                borderRadius: 3,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Today's Goals
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {lessonGeneratorData.todayGoals.map((goal) => (
                  <Box key={goal.id}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {goal.title}
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {goal.current}/{goal.target}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(goal.current / goal.target) * 100}
                      sx={{ borderRadius: 2, height: 6 }}
                    />
                  </Box>
                ))}
              </Box>
            </Paper>

            {/* Mini Calendar Section */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: 1,
                borderColor: "graycolor.two",
                borderRadius: 3,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Learning Calendar
              </Typography>

              <MiniCalendar markedDates={markedDates} />
            </Paper>
          </Box>
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>

      {/* Generate Lesson Dialog */}
      <Dialog
        open={openGenerateDialog}
        onClose={() => {
          setOpenGenerateDialog(false);
          setGrade("");
          setSubject("");
          setTopic("");
          setCustomTopic("");
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Generate New Lesson</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Custom Topic Input - Disabled if menu is selected */}
            <TextField
              fullWidth
              size="small"
              label="Enter a custom topic"
              placeholder="Type a custom topic name..."
              value={customTopic}
              onChange={(e) => {
                setCustomTopic(e.target.value);
                if (e.target.value.trim() !== "") {
                  setTopic("");
                }
              }}
              disabled={topic !== "" || grade !== ""}
              multiline
              rows={2}
              helperText={
                topic !== ""
                  ? "Clear the selected topic to enable custom input"
                  : customTopic.trim() !== ""
                  ? "Menu selection is disabled"
                  : ""
              }
            />        <Divider />


            {/* Grade Selection */}
            <FormControl fullWidth size="small">
              <InputLabel>Grade</InputLabel>
              <Select
                value={grade}
                onChange={(e) => {
                  setGrade(e.target.value);
                  setSubject("");
                  setTopic("");
                  setCustomTopic("");
                }}
                label="Grade"
                disabled={topic !== "" || customTopic.trim() !== ""}
              >
                <MenuItem value="">Select Grade</MenuItem>
                {lessonGeneratorData.grades.map((g) => (
                  <MenuItem key={g.value} value={g.value}>
                    {g.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Subject Selection */}
            <FormControl fullWidth size="small" disabled={!grade}>
              <InputLabel>Subject</InputLabel>
              <Select
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  setTopic("");
                  setCustomTopic("");
                }}
                label="Subject"
              >
                <MenuItem value="">Select Subject</MenuItem>
                {getSubjectsForGrade().map((s) => (
                  <MenuItem key={s.value} value={s.value}>
                    {s.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Topic Section Header */}
            {subject && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Topic
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7, display: "block", mb: 1.5 }}>
                  Select from existing topics or enter a custom topic below
                </Typography>
              </Box>
            )}

            


            {/* Topic Selection Dropdown - Disabled if custom topic is filled */}
            <FormControl
              fullWidth
              size="small"
              disabled={!subject || customTopic.trim() !== ""}
            >
              <InputLabel>Select Topic</InputLabel>
              <Select
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                }}
                label="Select Topic"
              >
                <MenuItem value="">Choose from existing topics</MenuItem>
                {getTopicsForSubject().map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            
          </Box>
        </DialogContent>
        <Divider />
        <Box sx={{ p: 2, display: "flex", gap: 1, justifyContent: "flex-end" }}>
          <Button
            onClick={() => {
              setOpenGenerateDialog(false);
              setGrade("");
              setSubject("");
              setTopic("");
              setCustomTopic("");
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerateLesson}
            variant="contained"
            disabled={!grade || !subject || (!topic && !customTopic.trim())}
          >
            Generate Lesson
          </Button>
        </Box>
      </Dialog>

      {/* Lesson Generation Loading Dialog */}
      <Dialog
        open={isGenerating}
        onClose={() => {}}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown
      >
        <Box
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            minHeight: 300,
            justifyContent: "center",
          }}
        >
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            {generatingMessage}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            This may take a moment while we're connecting to the LLM...
          </Typography>

          {/* Progress Steps */}
          <Box sx={{ mt: 3, width: "100%", textAlign: "left" }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  backgroundColor: "success.main",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 1,
                  fontSize: "0.75rem",
                }}
              >
                ✓
              </Box>
              <Typography variant="caption">Lesson created</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  backgroundColor: "primary.main",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 1,
                  fontSize: "0.75rem",
                }}
              >
                ◆
              </Box>
              <Typography variant="caption">Generating content</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  backgroundColor: "action.disabled",
                  color: "text.secondary",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 1,
                  fontSize: "0.75rem",
                }}
              >
                ○
              </Box>
              <Typography variant="caption">Finalizing</Typography>
            </Box>
          </Box>
        </Box>
      </Dialog>

      {/* Snackbar for notifications */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6">{selectedSubject?.name}</Typography>
          {selectedSubject?.grade_name && (
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              {selectedSubject.grade_name}
            </Typography>
          )}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          {!subjectLessons[selectedSubject?.id] ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
              <CircularProgress size={30} />
            </Box>
          ) : subjectLessons[selectedSubject?.id]?.length === 0 ? (
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              No lessons found for this subject.
            </Typography>
          ) : (
            <Box>
              {subjectLessons[selectedSubject?.id]?.map((lesson) => (
                <Accordion
                  key={lesson.id}
                  sx={{ mb: 1, border: 1, borderColor: "graycolor.two" }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                      }}
                    >
                      <Typography variant="subtitle2">
                        {lesson.title}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.6 }}>
                        {lesson.topics_count || 0} topics
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    {lesson.topics && lesson.topics.length > 0 ? (
                      <Box>
                        {lesson.topics.map((topic, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              mb: 1,
                              pl: 1,
                              borderLeft: 2,
                              borderColor: "primary.main",
                            }}
                          >
                            <Typography variant="body2">
                              {topic.title}
                            </Typography>
                            {topic.content && (
                              <Typography
                                variant="caption"
                                sx={{ opacity: 0.6, display: "block" }}
                              >
                                {topic.content.substring(0, 60)}...
                              </Typography>
                            )}
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="caption" sx={{ opacity: 0.6 }}>
                        No topics yet
                      </Typography>
                    )}
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      sx={{ mt: 2 }}
                      onClick={() => {
                        handleLessonClick(lesson.id);
                        handleCloseDialog();
                      }}
                    >
                      Open Lesson
                    </Button>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

// Mini Calendar Component
const MiniCalendar = ({ markedDates = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const isMarkedDate = (day) => {
    return markedDates.includes(
      `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`
    );
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Box>
      {/* Month Navigation */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Button size="small" onClick={handlePrevMonth}>
          ←
        </Button>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Typography>
        <Button size="small" onClick={handleNextMonth}>
          →
        </Button>
      </Box>

      {/* Day Headers */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 0.5,
          mb: 1,
        }}
      >
        {dayNames.map((day) => (
          <Typography
            key={day}
            variant="caption"
            sx={{
              textAlign: "center",
              fontWeight: 600,
              color: "text.secondary",
            }}
          >
            {day}
          </Typography>
        ))}
      </Box>

      {/* Calendar Days */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 0.5,
        }}
      >
        {days.map((day, index) => (
          <Box
            key={index}
            sx={{
              aspectRatio: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 1,
              backgroundColor: day
                ? isToday(day)
                  ? "primary.main"
                  : isMarkedDate(day)
                  ? "success.light"
                  : "transparent"
                : "transparent",
              color: day
                ? isToday(day)
                  ? "primary.contrastText"
                  : "inherit"
                : "transparent",
              border: day
                ? isMarkedDate(day)
                  ? "1px solid"
                  : "none"
                : "none",
              borderColor: isMarkedDate(day) ? "success.main" : "transparent",
              fontSize: "0.75rem",
              fontWeight: day ? 500 : 400,
            }}
          >
            {day}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default PlatformLessons;
