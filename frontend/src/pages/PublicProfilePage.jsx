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
  Stack,
} from "@mui/material";
import {
  Share,
  Edit,
  Mail,
  MenuBook,
  EmojiEvents,
  Quiz,
  ArrowBack,
  Twitter,
  LinkedIn,
  GitHub,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import profileApi from "../api/modules/profile.api";

const PublicProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.user);

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

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || "Profile not found"}</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
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
      active_reflective: { left: "Active", right: "Reflective" },
      sensing_intuitive: { left: "Sensing", right: "Intuitive" },
      visual_verbal: { left: "Visual", right: "Verbal" },
      sequential_global: { left: "Sequential", right: "Global" },
    };
    return labels[dimension] || { left: "", right: "" };
  };

  const getSocialIcon = (platform) => {
    const icons = {
      twitter: <Twitter sx={{ fontSize: 18 }} />,
      linkedin: <LinkedIn sx={{ fontSize: 18 }} />,
      github: <GitHub sx={{ fontSize: 18 }} />,
    };
    return icons[platform] || null;
  };

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
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ color: "text.secondary" }}
        >
          Back
        </Button>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Share Profile">
            <IconButton
              size="small"
              sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}
            >
              <Share />
            </IconButton>
          </Tooltip>
          {isOwnProfile && (
            <Tooltip title="Edit Profile">
              <IconButton
                size="small"
                onClick={() => navigate("/dashboard/settings")}
                sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}
              >
                <Edit />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* LEFT SIDEBAR - PROFILE INFO */}
        <Grid item xs={12} md={4}>
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
                src={getImageUrl(profile.profile_image)}
                sx={{
                  width: 140,
                  height: 140,
                  bgcolor: !getImageUrl(profile.profile_image) ? "action.hover" : "transparent",
                  fontSize: "3rem",
                  color: "primary.contrastText",
                }}
              >
                {!getImageUrl(profile.profile_image) && (
                  `${(profile.first_name?.charAt(0) || "").toUpperCase()}${(profile.last_name?.charAt(0) || "").toUpperCase()}`
                )}
              </Avatar>

              <Box sx={{ textAlign: "center" }}>
                <Box sx={{ display: "flex", gap: 1, justifyContent: "center", mb: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "primary.contrastText" }}
                  >
                    {profile.first_name}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "primary.contrastText" }}
                  >
                    {profile.last_name}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", mb: 1 }}
                >
                  @{profile.username}
                </Typography>

                {/* Email Display */}
                {profile.email && (
                  <Box sx={{ display: "flex", gap: 1, justifyContent: "center", alignItems: "center", mb: 2 }}>
                    <Mail sx={{ fontSize: 16, color: "text.secondary" }} />
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", fontSize: "0.85rem" }}
                    >
                      {profile.email}
                    </Typography>
                  </Box>
                )}

                {profile.status && (
                  <Chip label={profile.status} size="small" sx={{ mb: 2 }} />
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Bio Section */}
            {profile.bio && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: "primary.contrastText",
                    lineHeight: 1.6,
                  }}
                >
                  {profile.bio}
                </Typography>
                <Divider sx={{ mt: 2, mb: 0 }} />
              </Box>
            )}

            {/* Learning Styles Section */}
            {profile.learning_styles && (
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
                <Stack spacing={1.5}>
                  {Object.entries(profile.learning_styles).map(([dimension, value]) => {
                    const labels = getLearningStyleLabel(dimension);
                    const percentage = Math.max(0, Math.min(100, ((value + 11) / 22) * 100));
                    return (
                      <Box key={dimension}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.3 }}>
                          <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem" }}>
                            {labels.left}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem" }}>
                            {labels.right}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={percentage}
                          sx={{ height: 5, borderRadius: 3 }}
                        />
                      </Box>
                    );
                  })}
                </Stack>
                <Divider sx={{ mt: 2, mb: 0 }} />
              </Box>
            )}

            {/* Achievements Section */}
            {profile.achievements && profile.achievements.length > 0 && (
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
                        <Typography sx={{ fontSize: "1.8rem", textAlign: "center" }}>
                          ⭐
                        </Typography>
                      </Paper>
                    </Tooltip>
                  ))}
                </Box>
                <Divider sx={{ mt: 2, mb: 0 }} />
              </Box>
            )}

            {/* Social Links */}
            {profile.social_links && Object.keys(profile.social_links).length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, color: "primary.contrastText", mb: 2 }}
                >
                  Connect
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  {Object.entries(profile.social_links).map(([platform, link]) => (
                    <Tooltip key={platform} title={`Visit ${platform}`}>
                      <IconButton
                        size="small"
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          color: "text.secondary",
                          "&:hover": { color: "primary.main" },
                        }}
                      >
                        {getSocialIcon(platform)}
                      </IconButton>
                    </Tooltip>
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* RIGHT SIDE - LESSONS & QUIZZES */}
        <Grid item xs={12} md={8}>
          {/* Lessons by Grade */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: 1,
              borderColor: "graycolor.two",
              borderRadius: 3,
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "primary.contrastText" }}
              >
                📚 Learning Progress
              </Typography>
            </Box>

            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mb: 2 }}
            >
              This user's learning content is private. View their public profile information above.
            </Typography>
          </Paper>

          {/* Account Details (visible to all) */}
          {(profile.tagline || profile.other) && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: 1,
                borderColor: "graycolor.two",
                borderRadius: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "primary.contrastText", mb: 3 }}
              >
                📋 About
              </Typography>

              <Stack spacing={2}>
                {profile.tagline && (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5 }}
                    >
                      Tagline
                    </Typography>
                    <Typography variant="body2" sx={{ color: "primary.contrastText" }}>
                      {profile.tagline}
                    </Typography>
                  </Box>
                )}

                {profile.other?.subject && (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5 }}
                    >
                      Field of Study
                    </Typography>
                    <Typography variant="body2" sx={{ color: "primary.contrastText" }}>
                      {profile.other.subject}
                    </Typography>
                  </Box>
                )}

                {profile.other?.strength && (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5 }}
                    >
                      Strengths
                    </Typography>
                    <Typography variant="body2" sx={{ color: "primary.contrastText" }}>
                      {profile.other.strength}
                    </Typography>
                  </Box>
                )}

                {profile.other?.avg_hours && (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5 }}
                    >
                      Study Commitment
                    </Typography>
                    <Typography variant="body2" sx={{ color: "primary.contrastText" }}>
                      {profile.other.avg_hours} per day
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default PublicProfilePage;
