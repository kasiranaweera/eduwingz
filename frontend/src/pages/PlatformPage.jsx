import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Divider,
  TextField,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import dayjs from "dayjs";

import Image3D from "../assets/img/3d-image_2.jpg";
import uiConfigs from "../configs/ui.config";

// Components
import RecentActivities from "../components/RecentActivities";
import { useSelector } from "react-redux";
import lessonsApi from "../api/modules/lessons.api";
import lessonGeneratorData from "../assets/data/lessonGeneratorData.json";

const DashboardPlatformPage = () => {
  const { user } = useSelector((state) => state.user);
  const greeting = getGreeting();

  // States
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }

  const [lessons, setLessons] = useState([]);
  const [, setLoading] = useState(true);

  // Modal form states
  const [isGenerating, setIsGenerating] = useState(false);
  const [customTopic, setCustomTopic] = useState("");

  useEffect(() => {
    const fetchLessons = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const { response, err } = await lessonsApi.listLessons();
        if (!err && response) {
          setLessons(response);
        }
      } catch (error) {
        console.error("Failed to fetch lessons", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, [user]);

  // Derived arrays
  const popularLessons = lessons.slice(0, 3); // Or sort by views if available
  const recentLessons = lessons.slice(0, 3); // Assuming response is sorted by date descending

  // Dropdown data getters
  const getSubjectsForGrade = () => {
    if (!grade) return [];
    const selectedGrade = lessonGeneratorData.grades.find((g) => g.value === grade);
    return selectedGrade ? selectedGrade.subjects : [];
  };

  const getTopicsForSubject = () => {
    if (!grade || !subject) return [];
    const selectedGrade = lessonGeneratorData.grades.find((g) => g.value === grade);
    if (!selectedGrade) return [];
    const selectedSubjectObj = selectedGrade.subjects.find((s) => s.value === subject);
    return selectedSubjectObj ? selectedSubjectObj.topics : [];
  };

  const handleGenerateLesson = async () => {
    const finalTopic = customTopic || topic;
    if (!grade || !subject || !finalTopic) {
      alert("Please select all fields or enter a custom topic");
      return;
    }

    try {
      setIsGenerating(true);
      const { response: sessionRes, err: sessionErr } = await lessonsApi.createSession({
        title: `${subject}: ${finalTopic} (Grade ${grade})`,
        description: `Generated lesson for Grade ${grade} - ${subject} - ${finalTopic}`,
      });

      if (sessionErr) throw new Error("Failed to create session");

      const { err: genErr } = await lessonsApi.generateLesson({
        grade,
        subject,
        topic: finalTopic,
        lesson_id: sessionRes.id,
        lesson_type: topic ? "default" : "custom",
      });

      if (genErr) throw new Error("Failed to generate content");

      alert("Lesson generated successfully!");
      handleClose();
      // Optionally refresh lessons list here
      const { response: newLessons } = await lessonsApi.listLessons();
      if (newLessons) setLessons(newLessons);

      // Navigate to new lesson or let user click it
    } catch (err) {
      console.error(err);
      alert("Error generating lesson");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 9 }} spacing={2} container direction="column">
        <Grid container size={12} spacing={2}>
          <Grid item size={{ xs: 12, md: 9 }}>
            <Box
              sx={{
                p: 3,
                border: 0,
                borderColor: "graycolor.two",
                borderRadius: 3,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                height: "100%",
              }}
            >
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {greeting}, <strong>{user.username}</strong> 👋
                </Typography>
                <Typography>
                  Ready to continue your learning journey?
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item size={{ xs: 12, md: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: 1,
                borderColor: "graycolor.two",
                borderRadius: 3,
                textAlign: "center",
                "&:hover": {
                  cursor: "pointer",
                  background: uiConfigs.style.mainGradient.color,
                  color: "secondary.contrastText",
                },
              }}
              onClick={handleOpen}
            >
              <AutoAwesomeIcon sx={{ fontSize: 48 }} />
              <Typography sx={{ mt: 1 }}>Generate New Lesson</Typography>
            </Paper>
          </Grid>
        </Grid>
        <Grid container ize={12} spacing={2}>
          {/* My Lessons */}
          <Grid item size={{ xs: 12, md: 8 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: 1,
                borderColor: "graycolor.two",
                borderRadius: 3,
              }}
            >
              <Typography variant="h6">My Lessons</Typography>
              <Divider
                sx={{ mt: 1, mb: 3 }}
                orientation="horizontal"
                flexItem
              />{" "}
              <Typography variant="paragraph">Popular Lessons</Typography>
              <Box sx={{ display: "flex", gap: 1, mt: 1, mb: 3, flexWrap: 'wrap' }}>
                {popularLessons.map((lesson) => (
                  <Box
                    key={lesson.id}
                    sx={{
                      flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.33% - 8px)' },
                      minWidth: 0,
                      border: 1,
                      borderColor: "graycolor.two",
                      borderRadius: 2,
                      p: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    <Box sx={{ height: "100px" }}>
                      <img
                        src={Image3D}
                        alt="3D Illustration"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography noWrap title={lesson.title}>{lesson.title}</Typography>
                      <Typography variant="subtitle2" sx={{ opacity: 0.75 }}>
                        {lesson.topics_count || 0} Topics
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      variant="text"
                      href={`/dashboard/platform/lessons/${lesson.id}`}
                      sx={{
                        textTransform: "none",
                        "&:hover": { color: "primary.main" },
                      }}
                      endIcon={<ArrowRightAltIcon />}
                    >
                      Continue Learning
                    </Button>
                  </Box>
                ))}
              </Box>
              <Typography sx={{}} variant="paragraph">Recent Lessons</Typography>
              <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: 'wrap' }}>
                {recentLessons.map((lesson) => (
                  <Box
                    key={lesson.id}
                    sx={{
                      flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.33% - 8px)' },
                      minWidth: 0,
                      border: 1,
                      borderColor: "graycolor.two",
                      borderRadius: 2,
                      p: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    <Box sx={{ height: "100px" }}>
                      <img
                        src={Image3D}
                        alt="3D Illustration"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography noWrap title={lesson.title}>{lesson.title}</Typography>
                      <Typography variant="subtitle2" sx={{ opacity: 0.75 }}>
                        {lesson.topics_count || 0} Topics
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      variant="text"
                      href={`/dashboard/platform/lessons/${lesson.id}`}
                      sx={{
                        textTransform: "none",
                        "&:hover": { color: "primary.main" },
                      }}
                      endIcon={<ArrowRightAltIcon />}
                    >
                      Continue Learning
                    </Button>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
          {/* Notes & Community Tabs */}
          <Grid item size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: 1,
                borderColor: "graycolor.two",
                borderRadius: 3,
              }}
            >
              <Tabs
                value={tabValue}
                onChange={(e, newValue) => setTabValue(newValue)}
                variant="fullWidth"
              >
                <Tab label="Notes Summary" />
                <Tab label="Community" />
              </Tabs>
              <Divider sx={{ my: 1 }} />
              {tabValue === 0 && (
                <Typography>Here is your notes summary...</Typography>
              )}
              {tabValue === 1 && (
                <Typography>Community discussions and results...</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Grid>

      {/* RIGHT SIDEBAR */}
      <Grid item size={{ xs: 12, md: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            border: 1,
            borderColor: "graycolor.two",
            borderRadius: 3,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Calendar
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar defaultValue={dayjs()} />
          </LocalizationProvider>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Recent Activities
          </Typography>
          <RecentActivities />
        </Paper>
      </Grid>

      {/* MODAL FOR GENERATE LESSON */}
      <Modal open={openModal} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" mb={2}>
            Generate New Lesson
          </Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel>Grade</InputLabel>
            <Select
              value={grade}
              onChange={(e) => {
                setGrade(e.target.value);
                setSubject("");
                setTopic("");
              }}
              label="Grade"
            >
              {lessonGeneratorData.grades.map((g) => (
                <MenuItem key={g.value} value={g.value}>
                  {g.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" disabled={!grade}>
            <InputLabel>Subject</InputLabel>
            <Select
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setTopic("");
              }}
              label="Subject"
            >
              {getSubjectsForGrade().map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" disabled={!subject || customTopic !== ""}>
            <InputLabel>Topic</InputLabel>
            <Select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              label="Topic"
            >
              {getTopicsForSubject().map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="caption" color="text.secondary" display="block" align="center">
              OR
            </Typography>
          </Box>

          <FormControl fullWidth margin="normal">
            <TextField
              size="small"
              label="Enter custom topic"
              value={customTopic}
              onChange={(e) => {
                setCustomTopic(e.target.value);
                if (e.target.value) setTopic("");
              }}
              disabled={!!topic}
            />
          </FormControl>

          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            onClick={handleGenerateLesson}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate Lesson"}
          </Button>
        </Box>
      </Modal>
    </Grid>
  );
};

export default DashboardPlatformPage;
