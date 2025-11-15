import React, { useState } from "react";
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
} from "@mui/material";
import Image3D from "../assets/img/3d-image_2.jpg";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import uiConfigs from "../configs/ui.config";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

const PlatformLessons = () => {
  const [openModal, setOpenModal] = useState(false);
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [tabValue, setTabValue] = useState(0);

  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);

  return (
    <>
      <Box>
        <Typography variant="h5">My Lessons</Typography>
      </Box>
      <Grid sx={{ mt: 2 }} container spacing={3}>
        <Grid size={9} spacing={3} container direction="column">
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: 1,
              borderColor: "graycolor.two",
              borderRadius: 3,
            }}
          >
            <Typography variant="h6">Recent Lessons</Typography>
            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              {[1, 2, 3, 4].map((lesson) => (
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
                    <Typography>Advanced Mathematics</Typography>
                    <Typography variant="subtitle2" sx={{ opacity: 0.75 }}>
                      19 Topics
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="text"
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
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: 1,
              borderColor: "graycolor.two",
              borderRadius: 3,
            }}
          >
            <Typography variant="h6">Lessons</Typography>
            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              {[1, 2, 3, 4].map((lesson) => (
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
                    <Typography>Advanced Mathematics</Typography>
                    <Typography variant="subtitle2" sx={{ opacity: 0.75 }}>
                      19 Topics
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="text"
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
            <Box
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
            </Box>
            <Divider sx={{mt:2}} orientation="horizontal" flexItem />
            <Box>
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
                  alert(
                    `Generating lesson for ${grade} - ${subject} - ${topic}`
                  );
                  handleClose();
                }}
              >
                Generate Lesson
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default PlatformLessons;
