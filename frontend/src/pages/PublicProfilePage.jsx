import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Avatar,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  LinearProgress,
  Chip,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Share,
  Edit,
  Mail,
  EmojiEvents,
  ArrowBack,
  Twitter,
  LinkedIn,
  GitHub,
  Link as LinkIcon,
  Psychology,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import profileApi from "../api/modules/profile.api";
import uiConfigs from "../configs/ui.config";

const PublicProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user: currentUser } = useSelector((state) => state.user);
  const { themeMode } = useSelector((state) => state.themeMode);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { response, err } = await profileApi.getProfile(userId);
      if (err) {
        setError("Profile not found");
        return;
      }
      setProfile(response);
    } catch (error) {
      setError("Error loading profile");
    } finally {
      setLoading(false);
    }
  };

  const isOwnProfile = currentUser?.user_id === parseInt(userId) || currentUser?.id === parseInt(userId);
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

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: '60vh' }}>
        <CircularProgress sx={{ color: uiConfigs.style.mainGradient.color }} />
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Alert severity="error" sx={{ borderRadius: 3, width: '100%', maxWidth: 400 }}>{error || "Profile not found"}</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} variant="outlined" sx={{ borderRadius: 8 }}>
          Go Back
        </Button>
      </Box>
    );
  }

  const getImageUrl = (imageField) => {
    if (!imageField) return null;
    if (typeof imageField === "string") return imageField;
    if (imageField.url) return imageField.url;
    return null;
  };

  const getLearningStyleLabel = (dimension) => {
    const labels = {
      active_reflective: ["Active", "Reflective"],
      sensing_intuitive: ["Sensing", "Intuitive"],
      visual_verbal: ["Visual", "Verbal"],
      sequential_global: ["Sequential", "Global"],
    };
    return labels[dimension] || ["Left", "Right"];
  };

  return (
    <Box sx={{ pb: 6, position: 'relative' }}>
      {/* Background Decorative Elements */}
      <Box sx={{
        position: 'absolute',
        top: -100,
        left: -100, // Positioned on left for variety
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Header */}
      <Box sx={{ position: 'relative', zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ color: "text.primary", borderRadius: 8, px: 2, '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) } }}
        >
          Back
        </Button>
        <Box sx={{ display: "flex", gap: 1, bgcolor: premiumPaperStyle.bgcolor, backdropFilter: premiumPaperStyle.backdropFilter, borderRadius: 8, p: 0.5, border: premiumPaperStyle.border }}>
          <Tooltip title="Share Profile">
            <IconButton sx={{ color: "text.primary", "&:hover": { color: "primary.main", bgcolor: alpha(theme.palette.primary.main, 0.1) } }}>
              <Share fontSize="small" />
            </IconButton>
          </Tooltip>
          {isOwnProfile && (
            <Tooltip title="Edit Profile">
              <IconButton onClick={() => navigate("/dashboard/settings")} sx={{ color: "text.primary", "&:hover": { color: "primary.main", bgcolor: alpha(theme.palette.primary.main, 0.1) } }}>
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      <Grid container spacing={4} sx={{ position: 'relative', zIndex: 1 }}>
        {/* LEFT SIDEBAR - PROFILE INFO */}
        <Grid item xs={12} md={4} lg={3.5}>
          <Paper elevation={0} sx={{ ...premiumPaperStyle, position: "sticky", top: 24 }}>
            {/* Header/Cover Area inside Card */}
            <Box sx={{
              height: 100,
              borderRadius: 3,
              mb: -6,
              background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
              opacity: 0.8
            }} />

            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", position: 'relative' }}>
              <Avatar
                src={getImageUrl(profile.profile_image)}
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
                {!getImageUrl(profile.profile_image) && `${(profile.first_name?.charAt(0) || "").toUpperCase()}${(profile.last_name?.charAt(0) || "").toUpperCase()}`}
              </Avatar>

              <Box sx={{ textAlign: "center", mt: 2, width: '100%' }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary", letterSpacing: '-0.5px' }}>
                  {profile.first_name} {profile.last_name}
                </Typography>
                <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 600, mb: 1 }}>
                  @{profile.username}
                </Typography>

                {profile?.tagline && (
                  <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: 'italic', mb: 2 }}>
                    "{profile.tagline}"
                  </Typography>
                )}

                {profile.status && (
                  <Chip
                    label={profile.status}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      bgcolor: alpha(theme.palette.info.main, 0.1),
                      color: theme.palette.info.main,
                      border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
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
            {profile.social_links && Object.keys(profile.social_links).length > 0 && (
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
                          href={link} target="_blank" rel="noopener noreferrer"
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

        {/* RIGHT SIDE - CONTENT */}
        <Grid item xs={12} md={8} lg={8.5}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>

            {/* Learning Profile Overview */}
            {profile.learning_styles && (
              <Paper elevation={0} sx={{ ...premiumPaperStyle }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                  <Box sx={{ p: 1, borderRadius: 2, background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`, color: "white", display: 'flex', boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.3)}` }}>
                    <Psychology fontSize="small" />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Learning Style Matrix</Typography>
                </Box>

                <Grid container spacing={3}>
                  {Object.entries(profile.learning_styles).map(([dimension, value]) => {
                    const labels = getLearningStyleLabel(dimension);
                    const percentage = Math.max(0, Math.min(100, ((value + 11) / 22) * 100));
                    return (
                      <Grid item xs={12} sm={6} key={dimension}>
                        <Box sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.background.default, 0.4), border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: percentage < 50 ? 'primary.main' : 'text.secondary' }}>{labels[0]}</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: percentage >= 50 ? 'secondary.main' : 'text.secondary' }}>{labels[1]}</Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={percentage}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: alpha(theme.palette.text.primary, 0.05),
                              '& .MuiLinearProgress-bar': {
                                background: percentage < 50 ? `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.info.main} 100%)` : `linear-gradient(90deg, ${theme.palette.info.main} 0%, ${theme.palette.secondary.main} 100%)`
                              }
                            }}
                          />
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </Paper>
            )}

            {/* Achievements Section */}
            {profile.achievements && profile.achievements.length > 0 && (
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
                        <Typography sx={{ fontSize: "2rem" }}>⭐</Typography>
                      </Box>
                    </Tooltip>
                  ))}
                </Box>
              </Paper>
            )}

            {/* About (Account Details) */}
            {(profile.tagline || profile.other) && (
              <Paper elevation={0} sx={{ ...premiumPaperStyle }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  📋 About the Learner
                </Typography>

                <Grid container spacing={3}>
                  {profile.other?.subject && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.background.default, 0.4), border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5 }}>Field of Study</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: "primary.contrastText" }}>{profile.other.subject}</Typography>
                      </Box>
                    </Grid>
                  )}
                  {profile.other?.strength && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.background.default, 0.4), border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5 }}>Strengths</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: "primary.contrastText" }}>{profile.other.strength}</Typography>
                      </Box>
                    </Grid>
                  )}
                  {profile.other?.avg_hours && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.background.default, 0.4), border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5 }}>Study Commitment</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: "primary.contrastText" }}>{profile.other.avg_hours} per day</Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            )}

            {/* Private Learning Info Card */}
            <Paper elevation={0} sx={{
              ...premiumPaperStyle,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              py: 6,
              bgcolor: alpha(theme.palette.background.default, 0.8),
              border: `1px dashed ${alpha(theme.palette.divider, 0.5)}`
            }}>
              <Box sx={{ p: 2, borderRadius: '50%', bgcolor: alpha(theme.palette.text.disabled, 0.1), mb: 2 }}>
                <Typography sx={{ fontSize: '2rem' }}>🔒</Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Learning Content Private</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", textAlign: 'center', maxWidth: 400 }}>
                This user's active lessons and detailed quiz performances are private.
              </Typography>
            </Paper>

          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PublicProfilePage;
