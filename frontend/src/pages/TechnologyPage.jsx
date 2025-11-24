import React from "react";
import {
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  Paper,
} from "@mui/material";
import {
  Storage,
  Code as CodeIcon,
  Settings,
  Lightbulb,
  Security,
  DesktopWindowsOutlined,
  BoltOutlined,
  BarChartOutlined,
  StorageOutlined,
} from "@mui/icons-material";
import uiConfigs from "../configs/ui.config";

const TechnologyPage = () => {
  const technologyBlocks = [
    {
      icon: <DesktopWindowsOutlined sx={{ fontSize: 50, color: "primary.main" }} />,
      title: "AI Pattern Recognition",
      subtitle: "Understands How You Learn",
      description:
        "Our advanced AI analyzes your learning behavior and adapts in real-time to provide the perfect learning experience.",
      features: [
        "Understands your learning style (VARK) — identifies strengths and weaknesses.",
        "Adapts to your behavior in real time — dynamic adjustment to learning speed and method.",
        "Learns with you to teach for you — continual improvement through feedback loops.",
      ],
    },
    {
      icon: <BoltOutlined sx={{ fontSize: 50, color: "primary.main" }} />,
      title: "Adaptive Teaching Engine",
      subtitle: "Personalized Learning Delivery",
      description:
        "Every lesson is shaped to match your unique learning style, delivering content in the format that resonates with you.",
      features: [
        "Shapes lessons to match your style — customized content based on your learning profile.",
        "Delivers the right format at the right moment — from text to video to interactive exercises.",
        "Feels like a personal tutor guiding every step — comprehensive learning experience.",
      ],
    },
    {
      icon: <CodeIcon sx={{ fontSize: 50, color: "primary.main" }} />,
      title: "Modern Frontend (React.js)",
      subtitle: "Lightning-Fast User Experience",
      description:
        "Built with React.js for speed, responsiveness, and an intuitive interface on any device.",
      features: [
        "Fast, responsive, and clean — optimized for performance on all devices.",
        "Easy to use on any device — seamless cross-platform experience.",
        "Makes learning feel simple and intuitive — refined design that removes friction.",
      ],
    },
    {
      icon: <Storage sx={{ fontSize: 50, color: "primary.main" }} />,
      title: "Strong Backend (Django)",
      subtitle: "Reliable & Scalable Foundation",
      description:
        "Powered by Django for robust data management, security, and real-time AI processing.",
      features: [
        "Handles data, AI responses, and user sessions — secure real-time management system.",
        "Keeps everything secure and stable — robust architecture with daily backups.",
        "Ensures your progress is always safe — reliable data persistence and retrieval.",
      ],
    },
    {
      icon: <BarChartOutlined sx={{ fontSize: 50, color: "primary.main" }} />,
      title: "Smart Analytics",
      subtitle: "Data-Driven Learning Insights",
      description:
        "Beautiful dashboards and comprehensive analytics help you understand your learning journey and growth.",
      features: [
        "Tracks your learning journey — comprehensive progress monitoring.",
        "Shows progress in clear visuals — easy to understand dashboards.",
        "Helps you learn better, faster — actionable insights for improvement.",
      ],
    },
  ];

  const coreTechnologies = [
    {
      icon: <DesktopWindowsOutlined sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "AI/ML",
      description: "Core Learning Algorithms",
    },
    {
      icon: <CodeIcon sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "React.js",
      description: "Frontend Experience",
    },
    {
      icon: <Storage sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "Django",
      description: "Backend Framework",
    },
    {
      icon: <StorageOutlined sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "Database",
      description: "Data Persistence",
    },
    {
      icon: <Settings sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "Analytics",
      description: "Usage Tracking",
    },
  ];

  return (
    <Box sx={{ my: 6 }}>
      <Container sx={{ display: "flex", gap: 6, flexDirection: "column" }}>
        {/* Header Section */}
        <Box textAlign="center" mb={8}>
          <Typography
            variant="overline"
            sx={{
              color: "primary.main",
              fontWeight: 600,
              letterSpacing: 3,
              display: "block",
              mb: 1,
            }}
          >
            Powered by Advanced AI
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
              mb: 1,
            }}
          >
            <Typography
              variant="h3"
              sx={{ textAlign: "center", fontWeight: "600" }}
            >
              EduWingz's
            </Typography>
            <Typography
              variant="h3"
              sx={{
                textAlign: "center",
                fontWeight: "600",
                background: uiConfigs.style.mainGradient.color,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Technology
            </Typography>
          </Box>

          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: "md", mx: "auto" }}
          >
            Cutting-edge AI and modern engineering working together to create a
            personalized learning experience like no other.
          </Typography>
        </Box>

        {/* Technology Blocks */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4, mb: 10 }}>
          {technologyBlocks.map((block, index) => (
            <Card
              key={index}
              sx={{
                borderRadius: 3,
                p: 4,
                transition: "all 0.3s ease",
                border: "1px solid rgba(255, 152, 0, 0.1)",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 40px rgba(255, 152, 0, 0.15)",
                },
              }}
            >
              <Box sx={{ display: "flex", gap: 3, mb: 3 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: "rgba(255, 152, 0, 0.08)",
                    border: "1px solid rgba(255, 152, 0, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 80,
                    height: 80,
                  }}
                >
                  {block.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      mb: 0.5,
                    }}
                  >
                    {block.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "primary.main",
                      fontWeight: 600,
                      letterSpacing: 1,
                      mb: 1,
                    }}
                  >
                    {block.subtitle}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {block.description}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                  gap: 2,
                  pt: 3,
                  borderTop: "1px solid rgba(255, 152, 0, 0.1)",
                }}
              >
                {block.features.map((feature, featureIdx) => (
                  <Box
                    key={featureIdx}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      background: "rgba(255, 152, 0, 0.05)",
                      border: "1px solid rgba(255, 152, 0, 0.1)",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        background: "rgba(255, 152, 0, 0.1)",
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.7 }}
                    >
                      {feature}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Card>
          ))}
        </Box>

        {/* Core Technologies Section */}
        <Box textAlign="center" mb={10}>
          <Typography
            variant="overline"
            sx={{
              fontWeight: 600,
              letterSpacing: 3,
              display: "block",
              mb: 2,
            }}
          >
            Built With
          </Typography>

          <Typography
            variant="h4"
            sx={{
              fontWeight: "600",
              background: uiConfigs.style.mainGradient.color,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 2,
            }}
          >
            Industry-Leading Technologies
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ maxWidth: "lg", mx: "auto", mb: 5 }}
          >
            We use cutting-edge technologies to ensure performance, reliability,
            and security.
          </Typography>

          <Grid container spacing={3}>
            {coreTechnologies.map((tech, idx) => (
              <Grid item size={2.4} key={idx}>
                <Card
                  sx={{
                    height: "100%",
                    p: 3,
                    textAlign: "center",
                    borderRadius: 3,
                    transition: "all 0.3s ease",
                    border: "1px solid rgba(255, 152, 0, 0.1)",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 12px 40px rgba(255, 152, 0, 0.15)",
                      borderColor: "primary.main",
                    },
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box mb={2}>{tech.icon}</Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {tech.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tech.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA Section */}
        <Box textAlign="center" mb={5}>
          <Paper
            sx={{
              p: { xs: 5, md: 7 },
              borderRadius: 4,
              background: uiConfigs.style.mainGradient.color,
              boxShadow: "0 10px 40px rgba(255, 152, 0, 0.3)",
              maxWidth: 700,
              mx: "auto",
            }}
          >
            <Typography
              variant="h4"
              fontWeight={700}
              color="secondary.contrastText"
              gutterBottom
            >
              Experience the Technology Yourself
            </Typography>

            <Typography
              variant="h6"
              sx={{ color: "secondary.contrastText", mb: 4 }}
            >
              See how EduWingz's advanced technology transforms your learning
              experience.
            </Typography>

            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: "white",
                color: "primary.main",
                fontWeight: 700,
                px: 5,
                py: 1.5,
                borderRadius: 50,
                fontSize: "1rem",
                "&:hover": { bgcolor: "#f5f5f5" },
              }}
              href="/main"
            >
              Try It Now
            </Button>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default TechnologyPage;
