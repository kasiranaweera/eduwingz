import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Avatar,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  IconButton,
  Tooltip,
  LinearProgress,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Share,
  Edit,
  Twitter,
  LinkedIn,
  Link as LinkIcon,
  GitHub,
  Mail,
  EmojiEvents,
  Quiz,
  MenuBook,
  Psychology,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import profileApi from "../api/modules/profile.api";
import uiConfigs from "../configs/ui.config";

const DashboardProfilePage = () => {
  const { user } = useSelector((state) => state.user);
  const { themeMode } = useSelector((state) => state.themeMode);
  const navigate = useNavigate();
  const theme = useTheme();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      }
      if (err) {
        console.error("Profile fetch error", err);
        if (mounted) setError(err);
      }
    })();
    return () => (mounted = false);
  }, [userId]);

  // Sample static data for UI
  const lessonsByGrade = [
    {
      grade: "Grade 10",
      lessons: [
        { id: 1, title: "Basic Algebra", subject: "Mathematics", completed: true },
        { id: 2, title: "Chemical Reactions", subject: "Chemistry", completed: true },
        { id: 3, title: "Cell Biology", subject: "Biology", completed: false },
      ],
    },
  ];

  const quizzesBySubject = [
    {
      subject: "Mathematics",
      quizzes: [
        { id: 1, title: "Algebra Quiz 1", score: 95, total: 100, date: "2024-01-15" },
        { id: 2, title: "Geometry Basics", score: 88, total: 100, date: "2024-01-10" },
      ],
    }
  ];

  const handleEditOpen = () => {
    navigate("/dashboard/settings");
  };

  const isDark = themeMode === "dark";

  // Common styles for premium paper/card
  const premiumPaperStyle = {
    p: 3,
    borderRadius: 4,
    bgcolor: isDark ? alpha(theme.palette.background.paper, 0.4) : alpha('#ffffff', 0.8),
    backdropFilter: "blur(20px)",
    border: "1px solid",
    borderColor: isDark ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.common.black, 0.05),
    boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.05)',
  };

  if (!userId) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <Alert severity="warning" sx={{ borderRadius: 3 }}>Please login to view your profile.</Alert>
      </Box>
    );
  }

  if (loading && !profile) {
    return (
      <Box sx={{ p: 6, display: "flex", justifyContent: "center", alignItems: "center", minHeight: '60vh' }}>
        <CircularProgress sx={{ color: uiConfigs.style.mainGradient.color }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          Failed to load profile. Please try again.
        </Alert>
      </Box>
    );
  }

  if (!profile) return null;

  return (
    <Box sx={{ pb: 6, position: 'relative' }}>

      {/* Background Decorative Elements */}
      <Box sx={{
        position: 'absolute',
        top: -100,
        right: -100,
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <Box sx={{ position: 'relative', zIndex: 1, mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h4" sx={{ fontWeight: 800, background: uiConfigs.style.mainGradient.color, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          My Profile
        </Typography>
        <Box sx={{ display: "flex", gap: 1, bgcolor: premiumPaperStyle.bgcolor, backdropFilter: premiumPaperStyle.backdropFilter, borderRadius: 8, p: 0.5, border: premiumPaperStyle.border }}>
          <Tooltip title="Edit Settings">
            <IconButton onClick={handleEditOpen} sx={{ color: "text.primary", "&:hover": { color: "primary.main", bgcolor: alpha(theme.palette.primary.main, 0.1) } }}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Share Profile">
            <IconButton sx={{ color: "text.primary", "&:hover": { color: "primary.main", bgcolor: alpha(theme.palette.primary.main, 0.1) } }}>
              <Share fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={4} sx={{ position: 'relative', zIndex: 1 }}>
        {/* LEFT SIDEBAR */}
        <Grid item size={{ xs: 12, md: 4, lg: 4 }}>
          <Paper elevation={0} sx={{ ...premiumPaperStyle, position: { xs: 'static', md: 'sticky' }, top: 24 }}>
            {/* Header/Cover Area inside Card */}
            <Box sx={{
              height: 100,
              borderRadius: 3,
              mb: -6,
              background: uiConfigs.style.mainGradient.color,
              opacity: 0.8
            }} />

            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", position: 'relative' }}>
              <Avatar
                src={typeof profile.profile_image === 'string' ? profile.profile_image : profile.profile_image?.url}
                sx={{
                  width: 120, height: 120,
                  border: `4px solid ${theme.palette.background.paper}`,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  bgcolor: theme.palette.background.default,
                  color: "text.primary",
                  fontSize: "2.5rem",
                  fontWeight: 700
                }}
              >
                {!profile.profile_image && `${profile?.first_name?.charAt(0) || ''}${profile?.last_name?.charAt(0) || ''}`}
              </Avatar>

              <Box sx={{ textAlign: "center", mt: 2, width: '100%' }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary", letterSpacing: '-0.5px' }}>
                  {profile?.first_name} {profile?.last_name}
                </Typography>
                <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 600, mb: 1 }}>
                  @{profile?.username}
                </Typography>

                {profile?.tagline && (
                  <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: 'italic', mb: 2 }}>
                    "{profile.tagline}"
                  </Typography>
                )}

                {profile?.status && (
                  <Chip
                    label={profile.status}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.main,
                      border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                    }}
                  />
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 3, opacity: 0.5 }} />

            {/* Contact & Bio */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {profile?.email && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: "primary.main", display: 'flex' }}>
                    <Mail fontSize="small" />
                  </Box>
                  <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
                    {profile.email}
                  </Typography>
                </Box>
              )}
              {profile?.bio && (
                <Box sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                  <Typography variant="body2" sx={{ color: "text.primary", lineHeight: 1.6 }}>
                    {profile.bio}
                  </Typography>
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 3, opacity: 0.5 }} />

            {/* Social Links */}
            {profile?.social_links && Object.keys(profile.social_links).length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem', color: 'text.secondary' }}>
                  Social Profiles
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: 'wrap' }}>
                  {['twitter', 'linkedin', 'github', 'website'].map((platform) => {
                    const link = profile.social_links[platform];
                    if (!link) return null;
                    const Icon = platform === 'twitter' ? Twitter : platform === 'linkedin' ? LinkedIn : platform === 'github' ? GitHub : LinkIcon;
                    return (
                      <Tooltip key={platform} title={platform.charAt(0).toUpperCase() + platform.slice(1)}>
                        <IconButton
                          href={link} target="_blank"
                          sx={{
                            bgcolor: alpha(theme.palette.text.primary, 0.05),
                            "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.1), color: "primary.main", transform: 'translateY(-2px)' },
                            transition: 'all 0.2s'
                          }}
                        >
                          <Icon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    );
                  })}
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* RIGHT CONTENT AREA */}
        <Grid item size={{ xs: 12, md: 8, lg: 8 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>

            {/* Learning Style Section */}
            {profile?.learning_styles && (
              <Paper elevation={0} sx={{ ...premiumPaperStyle }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                  <Box sx={{ p: 1, borderRadius: 2, background: uiConfigs.style.mainGradient.color, color: "white", display: 'flex', boxShadow: '0 4px 12px rgba(255,143,0,0.3)' }}>
                    <Psychology fontSize="small" />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Learning Profile Dimensions
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  {Object.entries(profile.learning_styles).map(([key, value]) => {
                    const labels = {
                      active_reflective: ["Active", "Reflective"],
                      sensing_intuitive: ["Sensing", "Intuitive"],
                      visual_verbal: ["Visual", "Verbal"],
                      sequential_global: ["Sequential", "Global"]
                    }[key] || ["Left", "Right"];

                    const progress = Math.max(0, Math.min(100, ((value + 11) / 22) * 100));

                    return (
                      <Grid item size={{ xs: 12, sm: 6 }} key={key}>
                        <Box sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.background.default, 0.4), border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: progress < 50 ? 'primary.main' : 'text.secondary' }}>{labels[0]}</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: progress >= 50 ? 'primary.main' : 'text.secondary' }}>{labels[1]}</Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: alpha(theme.palette.text.primary, 0.05),
                              '& .MuiLinearProgress-bar': {
                                background: progress < 50 ? `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.warning.main} 100%)` : `linear-gradient(90deg, ${theme.palette.warning.main} 0%, ${theme.palette.primary.main} 100%)`
                              }
                            }}
                          />
                        </Box>
                      </Grid>
                    )
                  })}
                </Grid>
              </Paper>
            )}

            {/* Achievements Section */}
            {profile?.achievements && profile.achievements.length > 0 && (
              <Paper elevation={0} sx={{ ...premiumPaperStyle }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.1), color: "warning.main", display: 'flex' }}>
                    <EmojiEvents fontSize="small" />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Achievements</Typography>
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  {profile.achievements.map((achievement) => (
                    <Tooltip key={achievement.id} title={achievement.description} arrow placement="top">
                      <Box sx={{
                        width: 70, height: 70,
                        borderRadius: '50%',
                        bgcolor: alpha(theme.palette.background.default, 0.6),
                        border: `2px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                        "&:hover": {
                          transform: "scale(1.15) translateY(-5px)",
                          borderColor: "warning.main",
                          boxShadow: `0 10px 20px ${alpha(theme.palette.warning.main, 0.2)}`,
                        }
                      }}>
                        <Typography sx={{ fontSize: "2rem" }}>🏆</Typography>
                      </Box>
                    </Tooltip>
                  ))}
                </Box>
              </Paper>
            )}

            {/* Combined Lessons and Quizzes Grid */}
            <Grid container spacing={4}>
              <Grid item size={{ xs: 12, md: 6 }}>
                <Paper elevation={0} sx={{ ...premiumPaperStyle, height: '100%' }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.1), color: "info.main", display: 'flex' }}>
                      <MenuBook fontSize="small" />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Recent Lessons</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {lessonsByGrade[0].lessons.map((lesson) => (
                      <Card key={lesson.id} elevation={0} sx={{
                        bgcolor: alpha(theme.palette.background.default, 0.3),
                        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                        borderRadius: 3,
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: theme.palette.info.main,
                          bgcolor: alpha(theme.palette.info.main, 0.02)
                        }
                      }}>
                        <CardContent sx={{ p: '16px !important', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{lesson.title}</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{lesson.subject}</Typography>
                          </Box>
                          <Chip
                            label={lesson.completed ? "Done" : "Active"}
                            size="small"
                            sx={{
                              fontWeight: 600, fontSize: '0.7rem', height: 24,
                              ...(lesson.completed ? {
                                bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main'
                              } : {
                                bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main'
                              })
                            }}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </Paper>
              </Grid>

              <Grid item size={{ xs: 12, md: 6 }}>
                <Paper elevation={0} sx={{ ...premiumPaperStyle, height: '100%' }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.secondary.main, 0.1), color: "secondary.main", display: 'flex' }}>
                      <Quiz fontSize="small" />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Top Quizzes</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {quizzesBySubject[0].quizzes.map((quiz) => {
                      const percentage = (quiz.score / quiz.total) * 100;
                      return (
                        <Card key={quiz.id} elevation={0} sx={{
                          bgcolor: alpha(theme.palette.background.default, 0.3),
                          border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                          borderRadius: 3,
                          transition: 'all 0.2s',
                          '&:hover': { borderColor: theme.palette.secondary.main, bgcolor: alpha(theme.palette.secondary.main, 0.02) }
                        }}>
                          <CardContent sx={{ p: '16px !important' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{quiz.title}</Typography>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: percentage >= 90 ? 'success.main' : 'primary.main' }}>
                                {quiz.score}/{quiz.total}
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={percentage}
                              sx={{ height: 6, borderRadius: 3, bgcolor: alpha(theme.palette.divider, 0.5), '& .MuiLinearProgress-bar': { bgcolor: percentage >= 90 ? 'success.main' : 'primary.main' } }}
                            />
                          </CardContent>
                        </Card>
                      )
                    })}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardProfilePage;
