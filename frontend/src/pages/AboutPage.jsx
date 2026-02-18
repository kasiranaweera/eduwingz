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
  FilterCenterFocus,
  School,
  ChatBubbleOutline,
  TrendingUp,
  Visibility,
} from "@mui/icons-material";
import uiConfigs from "../configs/ui.config";
import front_img from "../assets/img/front-img.png";

const AboutPage = () => {
  const features = [
    {
      icon: <FilterCenterFocus sx={{ fontSize: 50, color: "primary.main" }} />,
      title: "Identify Learning Styles",
      description:
        "AI detects Visual, Auditory, Read/Write, or Kinesthetic preferences instantly.",
    },
    {
      icon: <School sx={{ fontSize: 50, color: "primary.main" }} />,
      title: "Personalized Lessons",
      description:
        "Every explanation adapts to how YOU learn best — diagrams, stories, text, or hands-on.",
    },
    {
      icon: <ChatBubbleOutline sx={{ fontSize: 50, color: "primary.main" }} />,
      title: "Real-time AI Tutor",
      description:
        "Ask anything, anytime. Get clear, patient, step-by-step help 24/7.",
    },
    {
      icon: <TrendingUp sx={{ fontSize: 50, color: "primary.main" }} />,
      title: "Track Progress",
      description:
        "Beautiful dashboards show strengths, growth areas, and mastery over time.",
    },
  ];

  return (
    <Box sx={{ my: 6 }}>
      <Container sx={{ display: "flex", gap: 6, flexDirection: "column" }}>
        <Box>
          <Box textAlign="center" sx={{}} mb={8}>
            <Typography
              variant="overline"
              sx={{
                color: "primary.ContrastText",
                fontWeight: 600,
                letterSpacing: 3,
                display: "block",
              }}
            >
              Welcome to the Future of Learning
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
                About
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
                EduWingz
              </Typography>
            </Box>

            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: "md", mx: "auto" }}
            >
              EduWingz is an AI-powered teaching assistant that understands how
              each student learns — and transforms lessons to match their unique
              style, pace, and preferences.
            </Typography>
          </Box>
          <Box mb={10}>
            <Paper
              elevation={3}
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                maxWidth: 900,
                mx: "auto",
                boxShadow: "0 10px 250px rgba(255, 152, 0, 0.3)",
              }}
            >
              <Box
                component="img"
                src={front_img}
                alt="Students learning with AI"
                sx={{
                  width: "100%",
                  height: "auto",
                  objectFit: "cover",
                }}
              />
            </Paper>
          </Box>
        </Box>

        <Grid container spacing={12} alignItems="center" mb={10}>
          <Grid item xs={12} md={6}>
            <Typography
              variant="overline"
              sx={{
                fontWeight: 600,
                letterSpacing: 3,
              }}
            >
              Our Mission
            </Typography>

            <Typography
              variant="h3"
              sx={{
                fontWeight: "600",
                background: uiConfigs.style.mainGradient.color,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 3,
              }}
            >
              Why We Created EduWingz
            </Typography>

            <Typography variant="h6" sx={{ mb: 3 }}>
              Every student has a unique way of learning. Some prefer visual
              diagrams, others thrive with hands-on activities. Yet traditional
              education often applies the same approach to everyone.
            </Typography>

            <Typography variant="h6" sx={{ mb: 3 }}>
              We built <strong>EduWingz</strong> to change that — combining
              cutting-edge AI with the Index of Learning Styles (ILS) model to
              deliver a personalized teaching assistant that adapts to how each
              student naturally learns best.
            </Typography>

            <Typography variant="h6" sx={{}}>
              When education aligns with individual learning styles, students
              don't just pass — they excel and truly understand.
            </Typography>
          </Grid>
        </Grid>
        <Box textAlign="center" mb={0}>
          <Typography
            variant="overline"
            sx={{
              fontWeight: 600,
              letterSpacing: 3,
              display: "block",
            }}
          >
            Powered by Intelligence
          </Typography>

          <Typography
            variant="h4"
            sx={{
              fontWeight: "600",
              background: uiConfigs.style.mainGradient.color,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 3,
            }}
          >
            What EduWingz Can Do
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ maxWidth: "lg", mx: "auto", mb: 4 }}
          >
            Built on the ILS (Index of Learning Styles) model, EduWingz adapts
            content in real time to match your learning preferences.
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              justifyContent: "center",
              mb: 5,
            }}
          >
            {[
              "Active / Reflective",
              "Sensing / Intuitive",
              "Visual / Verbal",
              "Sequential / Global",
            ].map((style) => (
              <Box
                key={style}
                sx={{
                  px: 3,
                  py: 1.5,
                  borderRadius: 50,
                  background: "rgba(255, 152, 0, 0.1)",
                  border: "1px solid rgba(255, 152, 0, 0.3)",
                }}
              >
                <Typography variant="body2" fontWeight={600} color="primary">
                  {style}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Grid container spacing={3} mb={10}>
          {features.map((feature, idx) => (
            <Grid item size={3} key={idx}>
              <Card
                sx={{
                  height: "100%",
                  p: 3,
                  textAlign: "center",
                  borderRadius: 3,
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                  },
                }}
              >
                <CardContent>
                  <Box mb={2}>{feature.icon}</Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary" lineHeight={1.7}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={6} alignItems="center" mb={10}>
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                width: "80%",
                height: "80%",
                mx: "auto",
                borderRadius: 3,
                background: "rgba(255, 152, 0, 0.08)",
                border: "2px solid rgba(255, 152, 0, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Visibility
                sx={{ fontSize: 130, color: "primary.main", opacity: 0.7 }}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6} textAlign={"right"}>
            <Typography
              variant="overline"
              sx={{
                fontWeight: 600,
                letterSpacing: 3,
              }}
            >
              The Future We're Building
            </Typography>

            <Typography
              variant="h3"
              sx={{
                fontWeight: "600",
                background: uiConfigs.style.mainGradient.color,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 3,
              }}
            >
              Our Vision & Promise
            </Typography>

            <Box mb={4}>
              <Typography variant="h6" color="primary.main" fontWeight={600}>
                Our Vision
              </Typography>
              <Typography
                color="text.secondary"
                paragraph
                sx={{ lineHeight: 1.8 }}
              >
                A world where every learner — no matter their location,
                background, or learning style — has access to a world-class,
                personal AI tutor.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" color="primary.main" fontWeight={600}>
                Our Promise
              </Typography>
              <Typography
                color="text.secondary"
                paragraph
                sx={{ lineHeight: 1.8 }}
              >
                We will never stop improving. Smarter AI. Richer content. Deeper
                personalization. EduWingz grows as you do.
              </Typography>
            </Box>
          </Grid>
          <Box sx={{ width: "100%" }}>
            <Typography
              fontWeight={700}
              variant="h4"
              color="primary.main"
              sx={{ textAlign: "center" }}
            >
              EduWingz — Learning that understands you.
            </Typography>
          </Box>
        </Grid>

        <Box textAlign="center" mb={10}>
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
              Ready to Transform Learning?
            </Typography>

            <Typography
              variant="h6"
              sx={{ color: "secondary.contrastText", mb: 4 }}
            >
              Join thousands of students and teachers already using EduWingz.
            </Typography>

            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: "white",
                color: "secondary.contrastText",
                fontWeight: 700,
                px: 5,
                py: 1.5,
                borderRadius: 50,
                fontSize: "1rem",
                "&:hover": { bgcolor: "#f5f5f5" },
              }}
              href="/main"
            >
              Get Started Free
            </Button>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default AboutPage;
