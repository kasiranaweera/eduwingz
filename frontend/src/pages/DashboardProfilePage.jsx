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
  Tab,
  Tabs,
  Card,
  CardContent,
  Divider,
  Container,
} from "@mui/material";
import {
  LocationOn,
  Business,
  Language,
  Email,
  Group,
  Star,
  ForkRight,
  Code,
  Book,
  CalendarToday,
  GitHub,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import profileApi from "../api/modules/profile.api";

const DashboardProfilePage = () => {
  const { user } = useSelector((state) => state.user);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
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
      if (response && mounted) setProfile(response);
      if (err) {
        console.error("Profile fetch error", err);
        if (mounted) setError(err);
      }
    })();
    return () => (mounted = false);
  }, [userId]);

  console.log("Profile data:", profile);

  // Sample data - replace with actual profile data from backend
  const repos = profile?.repositories || [
    {
      name: "awesome-react-components",
      description:
        "A collection of awesome React components for modern web apps",
      language: "JavaScript",
      stars: 245,
      forks: 67,
      color: "#f1e05a",
      updated: "2 days ago",
    },
    {
      name: "nodejs-api-template",
      description: "Production-ready Node.js API template with best practices",
      language: "TypeScript",
      stars: 189,
      forks: 42,
      color: "#3178c6",
      updated: "1 week ago",
    },
  ];

  const contributions = Array.from({ length: 52 }, () =>
    Array.from({ length: 7 }, () => Math.floor(Math.random() * 5))
  );

  const skills = profile?.skills || [
    "React",
    "Node.js",
    "TypeScript",
    "Python",
    "Docker",
    "AWS",
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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

  return (
    <Box sx={{}}>
      <Grid container spacing={3}>
        {/* Left Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: 1,
              borderColor: "graycolor.two",
              borderRadius: 3,
            }}
          >
            {/* Avatar and Basic Info */}
            <Box
              sx={{
                textAlign: "center",
                mb: 3,
                justifyContent: "center",
                alignItems: "center",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Avatar
                sx={{
                  width: 200,
                  height: 200,
                }}
              >
                {profile?.username}
              </Avatar>
              <Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      color: "#c9d1d9",
                      textTransform: "none",
                      "&::first-letter": {
                        textTransform: "uppercase",
                      },
                    }}
                  >
                    {profile?.first_name}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      color: "#c9d1d9",
                      textTransform: "none",
                      "&::first-letter": {
                        textTransform: "uppercase",
                      },
                    }}
                  >
                    {profile?.last_name}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{}}>
                  @{profile?.username}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<GitHub />}
                sx={{
                  borderColor: "#30363d",
                  color: "#c9d1d9",
                  "&:hover": {
                    borderColor: "#8b949e",
                    bgcolor: "#21262d",
                  },
                }}
              >
                Share My Profile
              </Button>
            </Box>

            {/* Bio */}
            <Typography variant="body2" sx={{ mb: 3, color: "#c9d1d9" }}>
              {profile?.bio || "Full-stack developer | Open source enthusiast"}
            </Typography>

            {/* Followers */}
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Group sx={{ fontSize: 18, color: "#8b949e" }} />
                <Typography variant="body2" sx={{ color: "#c9d1d9" }}>
                  <strong>{profile?.followers || 0}</strong> followers
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: "#c9d1d9" }}>
                <strong>{profile?.following || 0}</strong> following
              </Typography>
            </Box>

            <Divider sx={{ borderColor: "#30363d", mb: 3 }} />

            {/* Contact Info */}
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}
            >
              {profile?.company && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Business sx={{ fontSize: 18, color: "#8b949e" }} />
                  <Typography variant="body2" sx={{ color: "#c9d1d9" }}>
                    {profile.company}
                  </Typography>
                </Box>
              )}
              {profile?.location && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LocationOn sx={{ fontSize: 18, color: "#8b949e" }} />
                  <Typography variant="body2" sx={{ color: "#c9d1d9" }}>
                    {profile.location}
                  </Typography>
                </Box>
              )}
              {profile?.website && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Language sx={{ fontSize: 18, color: "#8b949e" }} />
                  <Typography
                    variant="body2"
                    component="a"
                    href={profile.website}
                    target="_blank"
                    sx={{
                      color: "#58a6ff",
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {profile.website}
                  </Typography>
                </Box>
              )}
              {(profile?.email || user?.email) && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Email sx={{ fontSize: 18, color: "#8b949e" }} />
                  <Typography variant="body2" sx={{ color: "#c9d1d9" }}>
                    {profile?.email || user?.email}
                  </Typography>
                </Box>
              )}
            </Box>

            <Divider sx={{ borderColor: "#30363d", mb: 3 }} />

            {/* Skills */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ mb: 2, fontWeight: 600, color: "#c9d1d9" }}
              >
                Skills
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    size="small"
                    sx={{
                      bgcolor: "#21262d",
                      color: "#58a6ff",
                      border: "1px solid #30363d",
                      "&:hover": {
                        bgcolor: "#30363d",
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          {/* Contribution Graph */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              bgcolor: "#161b22",
              border: "1px solid #30363d",
              borderRadius: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ mb: 2, fontWeight: 600, color: "#c9d1d9" }}
            >
              Contribution Activity
            </Typography>
            <Box sx={{ overflowX: "auto", pb: 2 }}>
              <Box sx={{ display: "flex", gap: 0.5, minWidth: 800 }}>
                {contributions.map((week, weekIndex) => (
                  <Box
                    key={weekIndex}
                    sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                  >
                    {week.map((day, dayIndex) => (
                      <Box
                        key={dayIndex}
                        sx={{
                          width: 12,
                          height: 12,
                          bgcolor:
                            day === 0
                              ? "#161b22"
                              : day === 1
                              ? "#0e4429"
                              : day === 2
                              ? "#006d32"
                              : day === 3
                              ? "#26a641"
                              : "#39d353",
                          borderRadius: 0.5,
                          border: "1px solid #30363d",
                        }}
                      />
                    ))}
                  </Box>
                ))}
              </Box>
            </Box>
          </Paper>

          {/* Tabs Section */}
          <Paper
            elevation={0}
            sx={{
              bgcolor: "#161b22",
              border: "1px solid #30363d",
              borderRadius: 2,
            }}
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                borderBottom: "1px solid #30363d",
                px: 2,
                "& .MuiTab-root": {
                  color: "#8b949e",
                  textTransform: "none",
                },
                "& .Mui-selected": {
                  color: "#c9d1d9",
                },
                "& .MuiTabs-indicator": {
                  bgcolor: "#f78166",
                },
              }}
            >
              <Tab icon={<Book />} iconPosition="start" label="Repositories" />
              <Tab icon={<Code />} iconPosition="start" label="Projects" />
              <Tab icon={<Star />} iconPosition="start" label="Stars" />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {activeTab === 0 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {repos.map((repo, index) => (
                    <Card
                      key={index}
                      sx={{
                        bgcolor: "#0d1117",
                        border: "1px solid #30363d",
                        "&:hover": { borderColor: "#8b949e" },
                      }}
                    >
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 1,
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{ color: "#58a6ff", fontWeight: 600 }}
                          >
                            {repo.name}
                          </Typography>
                          <Chip
                            label="Public"
                            size="small"
                            sx={{
                              bgcolor: "transparent",
                              color: "#8b949e",
                              border: "1px solid #30363d",
                            }}
                          />
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{ color: "#8b949e", mb: 2 }}
                        >
                          {repo.description}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 3 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: "50%",
                                bgcolor: repo.color,
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ color: "#c9d1d9" }}
                            >
                              {repo.language}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Star sx={{ fontSize: 16 }} />
                            <Typography variant="body2">
                              {repo.stars}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <ForkRight sx={{ fontSize: 16 }} />
                            <Typography variant="body2">
                              {repo.forks}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}

              {activeTab === 1 && (
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <Code sx={{ fontSize: 48, color: "#8b949e", mb: 2 }} />
                  <Typography sx={{ color: "#8b949e" }}>
                    No projects to show
                  </Typography>
                </Box>
              )}

              {activeTab === 2 && (
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <Star sx={{ fontSize: 48, color: "#8b949e", mb: 2 }} />
                  <Typography sx={{ color: "#8b949e" }}>
                    No starred repositories yet
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardProfilePage;
