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
  CardActions,
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
} from "@mui/material";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import uiConfigs from "../configs/ui.config";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import lessonsApi from "../api/modules/lessons.api";

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
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");

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
    if (!grade || !subject || !topic) {
      setSnackbar({
        open: true,
        message: "Please select all fields",
        severity: "warning",
      });
      return;
    }

    try {
      const { response, err } = await lessonsApi.createSession({
        title: `${subject}: ${topic} (Grade ${grade})`,
        description: `Grade ${grade} - ${subject} - ${topic}`,
      });

      if (err) {
        setSnackbar({
          open: true,
          message: "Failed to create lesson",
          severity: "error",
        });
        return;
      }

      setSnackbar({
        open: true,
        message: "Lesson created successfully!",
        severity: "success",
      });

      // Add new lesson to list
      setLessons([response, ...lessons]);

      // Clear form
      setGrade("");
      setSubject("");
      setTopic("");

      // Navigate to the new lesson
      setTimeout(() => {
        navigate(`/dashboard/platform/lessons/${response.id}`);
      }, 1000);
    } catch (err) {
      console.error("Error generating lesson:", err);
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

        {/* Sidebar - Generate New Lesson */}
        <Grid item size={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: 1,
              borderColor: "graycolor.two",
              borderRadius: 3,
              position: "sticky",
              top: 20,
            }}
          >
            <Box
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

            <Divider sx={{ mt: 2, mb: 2 }} orientation="horizontal" flexItem />

            <Box>
              <FormControl fullWidth margin="normal" size="small">
                <InputLabel>Grade</InputLabel>
                <Select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  label="Grade"
                >
                  <MenuItem value="">Select Grade</MenuItem>
                  <MenuItem value="10">Grade 10</MenuItem>
                  <MenuItem value="11">Grade 11</MenuItem>
                  <MenuItem value="12">Grade 12</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal" size="small">
                <InputLabel>Subject</InputLabel>
                <Select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  label="Subject"
                >
                  <MenuItem value="">Select Subject</MenuItem>
                  <MenuItem value="Mathematics">Mathematics</MenuItem>
                  <MenuItem value="Science">Science</MenuItem>
                  <MenuItem value="English">English</MenuItem>
                  <MenuItem value="Biology">Biology</MenuItem>
                  <MenuItem value="Physics">Physics</MenuItem>
                  <MenuItem value="Chemistry">Chemistry</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal" size="small">
                <InputLabel>Topic</InputLabel>
                <Select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  label="Topic"
                >
                  <MenuItem value="">Select Topic</MenuItem>
                  <MenuItem value="Algebra">Algebra</MenuItem>
                  <MenuItem value="Geometry">Geometry</MenuItem>
                  <MenuItem value="Biology">Biology</MenuItem>
                  <MenuItem value="Chemistry">Chemistry</MenuItem>
                  <MenuItem value="Grammar">Grammar</MenuItem>
                  <MenuItem value="Literature">Literature</MenuItem>
                </Select>
              </FormControl>

              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 2 }}
                onClick={handleGenerateLesson}
                disabled={!grade || !subject || !topic}
              >
                Generate Lesson
              </Button>
            </Box>
          </Paper>
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

      {/* Subject Lessons Dialog */}
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

export default PlatformLessons;
