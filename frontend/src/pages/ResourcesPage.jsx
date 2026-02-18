import React from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  DescriptionOutlined,
  VideoLibraryOutlined,
  ArticleOutlined,
  SchoolOutlined,
  LibraryBooksOutlined,
  DownloadOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  GetAppOutlined,
} from "@mui/icons-material";
import uiConfigs from "../configs/ui.config";

const ResourcesPage = () => {
  const documentations = [
    {
      icon: <DescriptionOutlined sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "Getting Started Guide",
      description: "A comprehensive guide to set up your EduWingz account and start your personalized learning journey.",
      link: "#",
      type: "PDF",
    },
    {
      icon: <VideoLibraryOutlined sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "Video Tutorials",
      description: "Step-by-step video guides on how to use all features of EduWingz effectively.",
      link: "#",
      type: "VIDEO",
    },
    {
      icon: <ArticleOutlined sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "Learning Style Guide",
      description: "Understand the VARK learning model and how it helps personalize your learning experience.",
      link: "#",
      type: "GUIDE",
    },
    {
      icon: <SchoolOutlined sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "Teacher Resources",
      description: "Tools and materials designed specifically for educators to enhance classroom experiences.",
      link: "#",
      type: "PDF",
    },
  ];

  const downloads = [
    {
      title: "EduWingz Mobile App",
      description: "Learn on the go with our mobile application",
      platforms: ["iOS", "Android"],
      version: "v1.0.0",
    },
    {
      title: "Quick Reference Card",
      description: "Printable guide with keyboard shortcuts and tips",
      platforms: ["PDF"],
      version: "v1.0",
    },
    {
      title: "Learning Profile Template",
      description: "Template to create your learning profile offline",
      platforms: ["PDF", "Word"],
      version: "v1.0",
    },
  ];

  const learningMaterials = [
    {
      title: "Understanding Your Learning Style",
      content:
        "Learn how the VARK model (Visual, Auditory, Read/Write, Kinesthetic) works and discover your unique learning preferences.",
    },
    {
      title: "Maximizing Your Learning Potential",
      content:
        "Tips and strategies to get the most out of your personalized learning experience with EduWingz.",
    },
    {
      title: "AI-Powered Learning: How It Works",
      content:
        "Explore how artificial intelligence adapts your learning content in real-time based on your progress and style.",
    },
    {
      title: "Best Practices for Online Learning",
      content:
        "Proven techniques and strategies for effective online education and self-paced learning.",
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
            Helpful Information
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
              mb: 2,
            }}
          >
            <Typography
              variant="h3"
              sx={{ textAlign: "center", fontWeight: "600" }}
            >
              Learning
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
              Resources
            </Typography>
          </Box>

          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: "md", mx: "auto" }}
          >
            Access comprehensive guides, tutorials, and materials to help you
            make the most of EduWingz and your personalized learning journey.
          </Typography>
        </Box>

        {/* Documentation Section */}
        <Box mb={10}>
          <Typography
            variant="h4"
            fontWeight={700}
            textAlign="center"
            mb={5}
          >
            Documentation & Guides
          </Typography>
          <Grid container spacing={3}>
            {documentations.map((doc, idx) => (
              <Grid item xs={12} size={6} md={3} key={idx}>
                <Card
                  sx={{
                    height: "100%",
                    p: 3,
                    borderRadius: 3,
                    border: "1px solid rgba(255, 152, 0, 0.1)",
                    transition: "all 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 12px 40px rgba(255, 152, 0, 0.15)",
                      borderColor: "primary.main",
                    },
                  }}
                >
                  <CardContent sx={{ p: 0, flex: 1 }}>
                    <Box mb={2}>{doc.icon}</Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {doc.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {doc.description}
                    </Typography>
                  </CardContent>
                  <Box sx={{ mt: 3, pt: 3, borderTop: "1px solid rgba(255, 152, 0, 0.1)" }}>
                    <Button
                      component="a"
                      href={doc.link}
                      size="small"
                      sx={{
                        color: "primary.main",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                        "&:hover": {
                          backgroundColor: "rgba(255, 152, 0, 0.1)",
                        },
                      }}
                      endIcon={<LinkOutlined sx={{ fontSize: 16 }} />}
                    >
                      {doc.type === "PDF" ? "Download" : "View"}
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Downloads Section */}
        <Box mb={10}>
          <Typography
            variant="h4"
            fontWeight={700}
            textAlign="center"
            mb={5}
          >
            Downloads
          </Typography>
          <Grid container spacing={3}>
            {downloads.map((download, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <Card
                  sx={{
                    height: "100%",
                    p: 3,
                    borderRadius: 3,
                    border: "1px solid rgba(255, 152, 0, 0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 12px 40px rgba(255, 152, 0, 0.15)",
                      borderColor: "primary.main",
                    },
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 1,
                          background: "rgba(255, 152, 0, 0.1)",
                          border: "1px solid rgba(255, 152, 0, 0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <GetAppOutlined
                          sx={{ fontSize: 28, color: "primary.main" }}
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight={700}>
                          {download.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          v{download.version}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 3, lineHeight: 1.6 }}
                    >
                      {download.description}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {download.platforms.map((platform) => (
                        <Box
                          key={platform}
                          sx={{
                            display: "inline-block",
                            px: 2,
                            py: 0.5,
                            mr: 1,
                            mb: 1,
                            borderRadius: 1,
                            background: "rgba(255, 152, 0, 0.1)",
                            border: "1px solid rgba(255, 152, 0, 0.2)",
                          }}
                        >
                          <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 600 }}>
                            {platform}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                    <Button
                      fullWidth
                      sx={{
                        background: uiConfigs.style.mainGradient.color,
                        color: "secondary.contrastText",
                        fontWeight: 700,
                        borderRadius: 1,
                        mt: 2,
                        "&:hover": {
                          opacity: 0.9,
                        },
                      }}
                      variant="contained"
                      startIcon={<DownloadOutlined />}
                    >
                      Download
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 6 }} />

        {/* Learning Materials Section */}
        <Box mb={10}>
          <Typography
            variant="h4"
            fontWeight={700}
            textAlign="center"
            mb={5}
          >
            Learning Materials
          </Typography>
          <Grid container spacing={3}>
            {learningMaterials.map((material, idx) => (
              <Grid item xs={12} size={6} key={idx}>
                <Card
                  sx={{
                    height: "100%",
                    p: 3,
                    borderRadius: 3,
                    border: "1px solid rgba(255, 152, 0, 0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 12px 40px rgba(255, 152, 0, 0.15)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                      <CheckCircleOutlined
                        sx={{
                          fontSize: 28,
                          color: "primary.main",
                          mt: 0.5,
                          flexShrink: 0,
                        }}
                      />
                      <Box>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                          {material.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ lineHeight: 1.7 }}
                        >
                          {material.content}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* FAQ Section */}
        <Box mb={10}>
          <Typography
            variant="h4"
            fontWeight={700}
            textAlign="center"
            mb={5}
          >
            Frequently Asked Questions
          </Typography>
          <Grid container spacing={3}>
            {[
              {
                q: "How do I get started with EduWingz?",
                a: "Create an account, complete the learning style assessment, and start exploring personalized lessons tailored to your preferences.",
              },
              {
                q: "Can I download resources for offline use?",
                a: "Yes, many of our learning materials are available for download. Check the Downloads section for available formats.",
              },
              {
                q: "Where can I find support?",
                a: "Visit our Help Center or contact our support team at support@eduwingz.com for assistance.",
              },
              {
                q: "Are the resources free?",
                a: "Basic resources are free for all users. Premium materials may require a subscription.",
              },
            ].map((faq, idx) => (
              <Grid item size={12} md={6} key={idx}>
                <Card
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: "1px solid rgba(255, 152, 0, 0.1)",
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {faq.q}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {faq.a}
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
              Ready to Learn More?
            </Typography>

            <Typography
              variant="h6"
              sx={{ color: "secondary.contrastText", mb: 4 }}
            >
              Explore our resources and start your personalized learning
              experience today.
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
              Start Learning
            </Button>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default ResourcesPage;
