import React from "react";
import {
  Box,
  Typography,
  Container,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { CloudDownload, Devices, School, Security } from "@mui/icons-material";
import uiConfigs from "../configs/ui.config";

const DownloadPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const downloadOptions = [
    {
      platform: "Windows",
      icon: <Devices fontSize="large" />,
      description: "For Windows 10/11 (64-bit)",
      buttonText: "Download for Windows",
      fileType: ".exe",
      size: "85 MB",
    },
    {
      platform: "macOS",
      icon: <Devices fontSize="large" />,
      description: "For macOS 10.15 and above",
      buttonText: "Download for Mac",
      fileType: ".dmg",
      size: "92 MB",
    },
    {
      platform: "Linux",
      icon: <Devices fontSize="large" />,
      description: "For Ubuntu/Debian based distributions",
      buttonText: "Download for Linux",
      fileType: ".deb",
      size: "78 MB",
    },
    {
      platform: "Mobile",
      icon: <Devices fontSize="large" />,
      description: "Available on App Store and Google Play",
      buttonText: "Get Mobile App (Android/iOS)",
      fileType: "",
      size: "",
    },
  ];

  const features = [
    {
      title: "Comprehensive Learning",
      description:
        "Access all your educational resources in one place with EduWingz.",
      icon: <School color="primary" fontSize="large" />,
    },
    {
      title: "Cross-Platform",
      description: "Seamless experience across all your devices.",
      icon: <Devices color="primary" fontSize="large" />,
    },
    {
      title: "Secure & Private",
      description: "Your data is always protected with end-to-end encryption.",
      icon: <Security color="primary" fontSize="large" />,
    },
  ];

  return (
    <Box sx={{ py: 10 }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box textAlign="center" mb={6}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography
              variant="h3"
              sx={{ textAlign: "center", fontWeight: "600" }}
            >
              Download
            </Typography>
            <Typography
              gutterBottom
              variant="h3"
              sx={{
                textAlign: "center",
                fontWeight: "600",
                background: uiConfigs.style.mainGradient.color,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              EduWingz
            </Typography>
          </Box>
          <Typography
            variant="h5"
            component="p"
            color="text.secondary"
            sx={{ maxWidth: 800, mx: "auto" }}
          >
            Transform your learning experience with EduWingz - the all-in-one
            education platform designed for students, teachers, and lifelong
            learners.
          </Typography>
        </Box>

        {/* Features Section */}
        <Grid container spacing={3} mb={6}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <Card
                sx={{
                  height: "100%",
                  textAlign: "center",
                  p: 3,
                  borderRadius: 5,
                  backgroundColor: "background.default",
                }}
              >
                <Box mb={2}>{feature.icon}</Box>
                <Typography
                  sx={{ fontWeight: "500" }}
                  variant="h5"
                  gutterBottom
                >
                  {feature.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {feature.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ mt: 10, mb: 5 }} />

        {/* Download Options */}
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          textAlign="center"
          sx={{ mb: 5, fontWeight: "500" }}
        >
          Available Platforms
        </Typography>

        <Grid container spacing={3}>
          {downloadOptions.map((option, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 5,
                  backgroundColor: "background.default",
                  transition: "transform 0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: theme.shadows[6],
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: "center" }}>
                  <Box mb={2} color={theme.palette.primary.main}>
                    {option.icon}
                  </Box>
                  <Typography variant="h5" gutterBottom>
                    {option.platform}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {option.description}
                  </Typography>
                  {option.size && (
                    <Typography variant="caption" color="text.secondary">
                      {option.fileType} • {option.size}
                    </Typography>
                  )}
                </CardContent>
                <Box p={3} textAlign="center">
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<CloudDownload />}
                    fullWidth
                    sx={{ py: 1.5, color:'secondary.contrastText', borderRadius:3 }}
                  >
                    {option.buttonText}
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Additional Info */}
        <Box mt={6} textAlign="center">
          <Typography variant="h6" gutterBottom>
            System Requirements
          </Typography>
          <Typography color="text.secondary" paragraph>
            Windows: 10/11 (64-bit) • macOS: 10.15 Catalina or later • Linux:
            Ubuntu 18.04/Debian 10 or later
          </Typography>
          <Typography  color="text.secondary">
            Minimum 4GB RAM, 2GHz processor, 500MB free disk space
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default DownloadPage;
