import React, { useState } from "react";
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

  const popularLesson = [
    { topic: "Lesson Topic", counts: "19 Topics", to: "/dashboard/platform/lessons/lessonId" },
    { topic: "Lesson Topic", counts: "19 Topics", to: "" },
    { topic: "Lesson Topic", counts: "19 Topics", to: "" },
  ];

  const resentLesson = [
    { topic: "Lesson Topic", counts: "19 Topics", to: "" },
    { topic: "Lesson Topic", counts: "19 Topics", to: "" },
    { topic: "Lesson Topic", counts: "19 Topics", to: "" },
  ];

  return (
    <Grid container spacing={3}>
      <Grid size={9} spacing={2} container direction="column">
        <Grid container size={12} spacing={2}>
          <Grid item size={9}>
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

          <Grid item size={3}>
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
          <Grid item size={8}>
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
              <Box sx={{ display: "flex", gap: 1, mt: 1, mb:3}}>
                {popularLesson.map((lesson) => (
                  <Box
                    key={lesson}
                    sx={{
                      width: "100%",
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
                      <Typography>{lesson.topic}</Typography>
                      <Typography variant="subtitle2" sx={{ opacity: 0.75 }}>
                        {lesson.counts}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      variant="text"
                      href={lesson.to}
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
              <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                {resentLesson.map((lesson) => (
                  <Box
                    key={lesson}
                    sx={{
                      width: "100%",
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
                      <Typography>{lesson.topic}</Typography>
                      <Typography variant="subtitle2" sx={{ opacity: 0.75 }}>
                        {lesson.counts}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      variant="text"
                      href={lesson.to}
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
          <Grid item size={4}>
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
      <Grid item size={3}>
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
              onChange={(e) => setGrade(e.target.value)}
              label="Grade"
            >
              <MenuItem value="10">Grade 10</MenuItem>
              <MenuItem value="11">Grade 11</MenuItem>
              <MenuItem value="12">Grade 12</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Subject</InputLabel>
            <Select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              label="Subject"
            >
              <MenuItem value="Math">Mathematics</MenuItem>
              <MenuItem value="Science">Science</MenuItem>
              <MenuItem value="English">English</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Topic</InputLabel>
            <Select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              label="Topic"
            >
              <MenuItem value="Algebra">Algebra</MenuItem>
              <MenuItem value="Biology">Biology</MenuItem>
              <MenuItem value="Grammar">Grammar</MenuItem>
            </Select>
          </FormControl>

          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => {
              alert(`Generating lesson for ${grade} - ${subject} - ${topic}`);
              handleClose();
            }}
          >
            Generate Lesson
          </Button>
        </Box>
      </Modal>
    </Grid>
  );
};

export default DashboardPlatformPage;
