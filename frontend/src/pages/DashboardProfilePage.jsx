import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Avatar,
  Typography,
  Button,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Share,
  Edit,
  Twitter,
  LinkedIn,
  Link as LinkIcon,
  GitHub,
  Mail,
  Star,
  EmojiEvents,
  Quiz,
  MenuBook,
  ArrowBack,
  MoreHoriz,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import profileApi from "../api/modules/profile.api";

const DashboardProfilePage = () => {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [activeTab, setActiveTab] = useState(0);

  const userId = user?.user_id || user?.id || null;

  useEffect(() => {
    if (!userId) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      const { response, err } = await profileApi.getProfile(userId);
      setLoading(false);
      if (response && mounted) {
        setProfile(response);
        setEditData(response);
      }
      if (err) {
        console.error("Profile fetch error", err);
        if (mounted) setError(err);
      }
    })();
    return () => (mounted = false);
  }, [userId]);

  // Sample lessons organized by grade
  const lessonsByGrade = [
    {
      grade: "Grade 10",
      lessons: [
        { id: 1, title: "Basic Algebra", subject: "Mathematics", completed: true },
        { id: 2, title: "Chemical Reactions", subject: "Chemistry", completed: true },
        { id: 3, title: "Cell Biology", subject: "Biology", completed: false },
      ],
    },
    {
      grade: "Grade 11",
      lessons: [
        { id: 4, title: "Calculus Basics", subject: "Mathematics", completed: true },
        { id: 5, title: "Organic Chemistry", subject: "Chemistry", completed: false },
        { id: 6, title: "Physics Mechanics", subject: "Physics", completed: true },
      ],
    },
  ];

  // Sample quizzes with highest marks
  const quizzesBySubject = [
    {
      subject: "Mathematics",
      quizzes: [
        { id: 1, title: "Algebra Quiz 1", score: 95, total: 100, date: "2024-01-15" },
        { id: 2, title: "Geometry Basics", score: 88, total: 100, date: "2024-01-10" },
      ],
    },
    {
      subject: "Chemistry",
      quizzes: [
        { id: 3, title: "Periodic Table", score: 92, total: 100, date: "2024-01-12" },
        { id: 4, title: "Chemical Bonds", score: 85, total: 100, date: "2024-01-08" },
      ],
    },
    {
      subject: "Physics",
      quizzes: [
        { id: 5, title: "Motion & Forces", score: 90, total: 100, date: "2024-01-14" },
      ],
    },
  ];

  const handleEditOpen = () => {
    setEditData(profile);
    navigate("/dashboard/settings");
  };

  const handleEditClose = () => {
    setEditOpen(false);
  };

  const handleSaveProfile = async () => {
    try {
      const { response, err } = await profileApi.updateProfile(userId, editData);
      if (err) {
        console.error("Update error", err);
        return;
      }
      setProfile(response);
      setEditOpen(false);
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  if (!userId) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Please login to view your profile.</Alert>
      </Box>
    );
  }

  if (loading && !profile) {
    return (
      <Box sx={{ p: 6, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load profile. Please try again.
        </Alert>
      </Box>
    );
  }

  console.log("Profile Data:", profile);

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, color: "primary.contrastText" }}>
          Profile
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Edit Profile">
            <IconButton
              size="small"
              onClick={handleEditOpen}
              sx={{
                color: "text.secondary",
                "&:hover": { color: "primary.main" },
              }}
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Share Profile">
            <IconButton
              size="small"
              sx={{
                color: "text.secondary",
                "&:hover": { color: "primary.main" },
              }}
            >
              <Share />
            </IconButton>
          </Tooltip>
          <Tooltip title="More Options">
            <IconButton
              size="small"
              sx={{
                color: "text.secondary",
                "&:hover": { color: "primary.main" },
              }}
            >
              <MoreHoriz />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* LEFT SIDEBAR - PROFILE INFO */}
        <Grid item xs={12} size={3}>
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
            {/* Profile Image and Basic Info */}
            <Box
              sx={{
                textAlign: "center",
                mb: 3,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                alignItems: "center",
              }}
            >
              <Avatar
                src={
                  (profile && (profile.profile_image?.url || (typeof profile.profile_image === 'string' && profile.profile_image))) || undefined
                }
                sx={{
                  width: 140,
                  height: 140,
                  bgcolor: !(profile && (profile.profile_image?.url || (typeof profile.profile_image === 'string' && profile.profile_image))) ? "action.hover" : "transparent",
                  fontSize: "3rem",
                  color: "primary.contrastText",
                }}
              >
                {/* Show initials only when there is no profile image */}
                {!(profile && (profile.profile_image?.url || (typeof profile.profile_image === 'string' && profile.profile_image))) && (
                  `${(profile?.first_name?.charAt(0) || '').toUpperCase()}${(profile?.last_name?.charAt(0) || '').toUpperCase()}`
                )}
              </Avatar>

              <Box sx={{ textAlign: "center" }}>
                <Box sx={{ display: "flex", gap: 1, justifyContent: "center", mb: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "primary.contrastText",
                    }}
                  >
                    {profile?.first_name}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "primary.contrastText",
                    }}
                  >
                    {profile?.last_name}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    mb: 1,
                  }}
                >
                  @{profile?.username}
                </Typography>

                {/* Email Display */}
                {profile?.email && (
                  <Box sx={{ display: "flex", gap: 1, justifyContent: "center", alignItems: "center", mb: 2 }}>
                    <Mail sx={{ fontSize: 16, color: "text.secondary" }} />
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                      }}
                    >
                      {profile.email}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            <Divider sx={{ mt: 1, mb: 3 }} orientation="horizontal" flexItem />

            {/* Bio Section */}
            {profile?.bio && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: "primary.contrastText",
                    lineHeight: 1.6,
                    mb: 2,
                  }}
                >
                  {profile.bio}
                </Typography>
                <Divider sx={{ mt: 1, mb: 3 }} orientation="horizontal" flexItem />
              </Box>
            )}

            {/* Learning Styles Section */}
            {profile?.learning_styles && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <MenuBook sx={{ color: "primary.main", fontSize: 20 }} />
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, color: "primary.contrastText" }}
                  >
                    Learning Styles
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {/* Active-Reflective */}
                  <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        Active
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        Reflective
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.max(0, Math.min(100, ((profile.learning_styles.active_reflective + 11) / 22) * 100))}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>

                  {/* Sensing-Intuitive */}
                  <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        Sensing
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        Intuitive
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.max(0, Math.min(100, ((profile.learning_styles.sensing_intuitive + 11) / 22) * 100))}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>

                  {/* Visual-Verbal */}
                  <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        Visual
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        Verbal
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.max(0, Math.min(100, ((profile.learning_styles.visual_verbal + 11) / 22) * 100))}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>

                  {/* Sequential-Global */}
                  <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        Sequential
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        Global
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.max(0, Math.min(100, ((profile.learning_styles.sequential_global + 11) / 22) * 100))}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                </Box>
                <Divider sx={{ mt: 3, mb: 3 }} orientation="horizontal" flexItem />
              </Box>
            )}

            {/* Legacy Learning Style Section */}
            {profile?.learning_style && !profile?.learning_styles && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <MenuBook sx={{ color: "primary.main", fontSize: 20 }} />
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, color: "primary.contrastText" }}
                  >
                    Learning Style
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "primary.contrastText",
                      fontWeight: 500,
                    }}
                  >
                    {profile.learning_style.current_style}
                  </Typography>
                  {profile.learning_style.confidence !== undefined && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={profile.learning_style.confidence * 100}
                        sx={{ flex: 1, height: 6, borderRadius: 3 }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary", minWidth: 40 }}
                      >
                        {Math.round(profile.learning_style.confidence * 100)}%
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Divider sx={{ mt: 3, mb: 3 }} orientation="horizontal" flexItem />
              </Box>
            )}

            {/* Achievements/Badges Section */}
            {profile?.achievements && profile.achievements.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <EmojiEvents sx={{ color: "primary.main", fontSize: 20 }} />
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, color: "primary.contrastText" }}
                  >
                    Achievements
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                  {profile.achievements.map((achievement) => (
                    <Tooltip key={achievement.id} title={achievement.description}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          border: 1,
                          borderColor: "graycolor.two",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 56,
                          height: 56,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          "&:hover": {
                            transform: "scale(1.1)",
                            borderColor: "primary.main",
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "1.8rem",
                            textAlign: "center",
                          }}
                        >
                          ⭐
                        </Typography>
                      </Paper>
                    </Tooltip>
                  ))}
                </Box>
                <Divider sx={{ mt: 3, mb: 3 }} orientation="horizontal" flexItem />
              </Box>
            )}

            {/* Social Links */}
            {profile?.social_links && Object.keys(profile.social_links).length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, color: "primary.contrastText", mb: 2 }}
                >
                  Connect
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  {profile.social_links.twitter && (
                    <Tooltip title="Twitter">
                      <IconButton
                        size="small"
                        href={profile.social_links.twitter}
                        target="_blank"
                        sx={{ color: "text.secondary", "&:hover": { color: "#1DA1F2" } }}
                      >
                        <Twitter />
                      </IconButton>
                    </Tooltip>
                  )}
                  {profile.social_links.linkedin && (
                    <Tooltip title="LinkedIn">
                      <IconButton
                        size="small"
                        href={profile.social_links.linkedin}
                        target="_blank"
                        sx={{ color: "text.secondary", "&:hover": { color: "#0077b5" } }}
                      >
                        <LinkedIn />
                      </IconButton>
                    </Tooltip>
                  )}
                  {profile.social_links.github && (
                    <Tooltip title="GitHub">
                      <IconButton
                        size="small"
                        href={profile.social_links.github}
                        target="_blank"
                        sx={{ color: "text.secondary", "&:hover": { color: "primary.contrastText" } }}
                      >
                        <GitHub />
                      </IconButton>
                    </Tooltip>
                  )}
                  {profile.social_links.website && (
                    <Tooltip title="Website">
                      <IconButton
                        size="small"
                        href={profile.social_links.website}
                        target="_blank"
                        sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}
                      >
                        <LinkIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* RIGHT SIDE - CONTENT SECTIONS */}
        <Grid item xs={12} size={9}>
          {/* LESSONS SECTION */}
          <Paper
            elevation={0}
            sx={{
              mb: 3,
              p: 3,
              border: 1,
              borderColor: "graycolor.two",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <MenuBook sx={{ color: "primary.main", fontSize: 24 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.contrastText" }}>
                My Lessons
              </Typography>
            </Box>
            <Divider sx={{ mt: 1, mb: 3 }} orientation="horizontal" flexItem />

            <Box sx={{ p: 3 }}>
              {lessonsByGrade.map((gradeGroup, idx) => (
                <Box key={idx} sx={{ mb: idx < lessonsByGrade.length - 1 ? 3 : 0 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      color: "primary.main",
                      mb: 2,
                      fontSize: "0.95rem",
                    }}
                  >
                    {gradeGroup.grade}
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {gradeGroup.lessons.map((lesson) => (
                      <Card
                        key={lesson.id}
                        sx={{
                          bgcolor: "transparent",
                          border: 1,
                          borderColor: "divider",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          "&:hover": {
                            borderColor: "primary.main",
                            transform: "translateX(2px)",
                          },
                        }}
                      >
                        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  color: "primary.main",
                                  mb: 0.5,
                                }}
                              >
                                {lesson.title}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "text.secondary" }}
                              >
                                {lesson.subject}
                              </Typography>
                            </Box>
                            <Chip
                              label={lesson.completed ? "Completed" : "In Progress"}
                              size="small"
                              sx={{
                                bgcolor: lesson.completed ? "primary.main" : "transparent",
                                color: "primary.contrastText",
                                border: lesson.completed
                                  ? "none"
                                  : "1px solid",
                                borderColor: "graycolor.two",
                              }}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>

                  {idx < lessonsByGrade.length - 1 && (
                    <Divider
                      sx={{
                        my: 3,
                      }}
                      orientation="horizontal"
                      flexItem
                    />
                  )}
                </Box>
              ))}
            </Box>
          </Paper>

          {/* QUIZ SECTION - TOP MARKING */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: 1,
              borderColor: "graycolor.two",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Quiz sx={{ color: "primary.main", fontSize: 24 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.contrastText" }}>
                Top Quizzes
              </Typography>
            </Box>
            <Divider sx={{ mt: 1, mb: 3 }} orientation="horizontal" flexItem />

            <Box sx={{ p: 3 }}>
              {quizzesBySubject.map((subjectGroup, idx) => (
                <Box key={idx} sx={{ mb: idx < quizzesBySubject.length - 1 ? 3 : 0 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      color: "primary.main",
                      mb: 2,
                      fontSize: "0.95rem",
                    }}
                  >
                    {subjectGroup.subject}
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {subjectGroup.quizzes.map((quiz) => {
                      const percentage = (quiz.score / quiz.total) * 100;
                      return (
                        <Card
                          key={quiz.id}
                          sx={{
                            bgcolor: "transparent",
                            border: 1,
                            borderColor: "divider",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            "&:hover": {
                              borderColor: "primary.main",
                              transform: "translateX(2px)",
                            },
                          }}
                        >
                          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                mb: 1.5,
                              }}
                            >
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    color: "primary.contrastText",
                                    mb: 0.5,
                                  }}
                                >
                                  {quiz.title}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "text.secondary" }}
                                >
                                  {quiz.date}
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: "right" }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 700,
                                    color:
                                      percentage >= 90
                                        ? "success.main"
                                        : percentage >= 80
                                        ? "primary.main"
                                        : percentage >= 70
                                        ? "warning.main"
                                        : "error.main",
                                  }}
                                >
                                  {quiz.score}/{quiz.total}
                                </Typography>
                              </Box>
                            </Box>

                            <Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  mb: 0.5,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{ color: "text.secondary" }}
                                >
                                  Score
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "text.secondary" }}
                                >
                                  {Math.round(percentage)}%
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={percentage}
                                sx={{
                                  bgcolor: "action.hover",
                                  "& .MuiLinearProgress-bar": {
                                    bgcolor:
                                      percentage >= 90
                                        ? "success.main"
                                        : percentage >= 80
                                        ? "primary.main"
                                        : percentage >= 70
                                        ? "warning.main"
                                        : "error.main",
                                  },
                                }}
                              />
                            </Box>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </Box>

                  {idx < quizzesBySubject.length - 1 && (
                    <Divider
                      sx={{
                        my: 3,
                      }}
                      orientation="horizontal"
                      flexItem
                    />
                  )}
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* EDIT PROFILE DIALOG */}
      <Dialog open={editOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: "primary.contrastText" }}>Edit Profile</DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            mt: 2,
            "& .MuiTextField-root": {
              "& .MuiOutlinedInput-root": {
                color: "primary.contrastText",
                "& fieldset": {
                  borderColor: "graycolor.two",
                },
                "&:hover fieldset": {
                  borderColor: "primary.main",
                },
              },
              "& .MuiOutlinedInput-input::placeholder": {
                color: "text.secondary",
                opacity: 1,
              },
            },
          }}
        >
          <TextField
            fullWidth
            label="First Name"
            value={editData.first_name || ""}
            onChange={(e) =>
              setEditData({ ...editData, first_name: e.target.value })
            }
            size="small"
          />
          <TextField
            fullWidth
            label="Last Name"
            value={editData.last_name || ""}
            onChange={(e) =>
              setEditData({ ...editData, last_name: e.target.value })
            }
            size="small"
          />
          <TextField
            fullWidth
            label="Bio"
            value={editData.bio || ""}
            onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
            multiline
            rows={3}
            size="small"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleEditClose} sx={{ color: "text.secondary" }}>
            Cancel
          </Button>
          <Button onClick={handleSaveProfile} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardProfilePage;
