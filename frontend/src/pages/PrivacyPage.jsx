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
  SecurityOutlined,
  LockOutlined,
  GroupOutlined,
  BusinessOutlined,
  RefreshOutlined,
  KeyOutlined,
  DescriptionOutlined,
  PublicOutlined,
  CheckCircleOutlined,
} from "@mui/icons-material";
import { FilterCenterFocusOutlined } from "@mui/icons-material";
import uiConfigs from "../configs/ui.config";

const PrivacyPage = () => {
  const PolicySection = ({ icon: Icon, title, children }) => (
    <Box sx={{ mb: 6 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
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
          <Icon sx={{ fontSize: 28, color: "primary.main" }} />
        </Box>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
          }}
        >
          {title}
        </Typography>
      </Box>
      <Box sx={{ pl: 7 }}>{children}</Box>
    </Box>
  );

  const PolicyCard = ({ icon: Icon, title, description }) => (
    <Card
      sx={{
        height: "100%",
        p: 2.5,
        borderRadius: 2,
        border: "1px solid rgba(255, 152, 0, 0.1)",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 24px rgba(255, 152, 0, 0.15)",
          borderColor: "primary.main",
        },
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
          <Icon sx={{ fontSize: 28, color: "primary.main", mt: 0.5 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

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
            Legal
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
              Privacy
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
              Policy
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Last Updated: November 2025
          </Typography>

          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: "md", mx: "auto" }}
          >
            Your privacy is critically important to us. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your
            information when you use our services.
          </Typography>
        </Box>

        {/* Intro Banner */}
        <Paper
          sx={{
            p: 4,
            borderRadius: 3,
            background: "rgba(255, 152, 0, 0.05)",
            border: "1px solid rgba(255, 152, 0, 0.2)",
            mb: 6,
          }}
        >
          <Typography variant="h6" color="text.secondary" sx={{ lineHeight: 1.8 }}>
            We are committed to protecting your personal data and ensuring
            transparency about how we process information. Our platform uses
            advanced security measures to keep your learning data safe while
            personalizing your educational experience.
          </Typography>
        </Paper>

        {/* 1. Information We Collect */}
        <PolicySection icon={GroupOutlined} title="Information We Collect">
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3, lineHeight: 1.8 }}
          >
            To personalize your learning experience, we collect only what's
            necessary:
          </Typography>
          <List sx={{ pl: 2 }}>
            {[
              "Basic account details (name, email, profile picture)",
              "Your learning style preferences (VARK model)",
              "Interaction history with our AI assistant",
              "Progress and performance data",
              "Device and usage information for improving the platform",
            ].map((item, index) => (
              <ListItem key={index} sx={{ pl: 0 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <CheckCircleOutlined
                    sx={{ color: "primary.main", fontSize: 20 }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={item}
                  primaryTypographyProps={{ variant: "body2" }}
                />
              </ListItem>
            ))}
          </List>
        </PolicySection>

        {/* 2. How We Use Your Information */}
        <PolicySection icon={KeyOutlined} title="How We Use Your Information">
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <List sx={{ p: 0 }}>
                {[
                  "Provide and maintain services",
                  "Process transactions",
                  "Customer support",
                ].map((item, index) => (
                  <ListItem key={index} sx={{ pl: 0, py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <Typography
                        sx={{ color: "primary.main", fontWeight: 700 }}
                      >
                        →
                      </Typography>
                    </ListItemIcon>
                    <ListItemText
                      primary={item}
                      primaryTypographyProps={{ variant: "body2" }}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={12} sm={6}>
              <List sx={{ p: 0 }}>
                {[
                  "Improve user experience",
                  "Send communications",
                  "Prevent fraud",
                ].map((item, index) => (
                  <ListItem key={index} sx={{ pl: 0, py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <Typography
                        sx={{ color: "primary.main", fontWeight: 700 }}
                      >
                        →
                      </Typography>
                    </ListItemIcon>
                    <ListItemText
                      primary={item}
                      primaryTypographyProps={{ variant: "body2" }}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </PolicySection>

        {/* 3. Cookies & Tracking */}
        <PolicySection icon={DescriptionOutlined} title="Cookies & Tracking">
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
            We use cookies and similar tracking technologies to track activity
            and store information. This helps us understand how you use our
            platform and improve your learning experience. You can instruct your
            browser to refuse cookies, but some features may not function
            properly without them.
          </Typography>
        </PolicySection>

        {/* 4. Data Security */}
        <PolicySection icon={LockOutlined} title="Data Security">
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4, lineHeight: 1.8 }}
          >
            We implement appropriate security measures to protect your
            information. However, no method of transmission over the internet is
            100% secure. We continually update our security practices to protect
            against unauthorized access.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <PolicyCard
                icon={SecurityOutlined}
                title="Encryption"
                description="Data encrypted in transit and at rest"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <PolicyCard
                icon={LockOutlined}
                title="Secure Servers"
                description="Enterprise-grade security infrastructure"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <PolicyCard
                icon={PublicOutlined}
                title="Access Control"
                description="Role-based access permissions"
              />
            </Grid>
          </Grid>
        </PolicySection>

        {/* 5. Third-Party Services */}
        <PolicySection icon={BusinessOutlined} title="Third-Party Services">
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
            We may employ third-party companies and individuals to facilitate
            our service. These parties have access to your information only to
            perform tasks on our behalf and are obligated not to disclose or use
            it for other purposes. We ensure all third-party partners comply
            with strict data protection standards.
          </Typography>
        </PolicySection>

        {/* 6. Your Privacy Rights */}
        <PolicySection icon={FilterCenterFocusOutlined} title="Your Privacy Rights">
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3, lineHeight: 1.8 }}
          >
            You have the right to control your personal data. Under applicable
            data protection laws, you have the following rights:
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <List sx={{ p: 0 }}>
                {[
                  "Access your information",
                  "Request data deletion",
                ].map((item, index) => (
                  <ListItem key={index} sx={{ pl: 0, py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <Typography
                        sx={{ color: "primary.main", fontWeight: 700 }}
                      >
                        •
                      </Typography>
                    </ListItemIcon>
                    <ListItemText
                      primary={item}
                      primaryTypographyProps={{ variant: "body2" }}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={12} sm={6}>
              <List sx={{ p: 0 }}>
                {[
                  "Correct inaccurate data",
                  "Object to processing",
                ].map((item, index) => (
                  <ListItem key={index} sx={{ pl: 0, py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <Typography
                        sx={{ color: "primary.main", fontWeight: 700 }}
                      >
                        •
                      </Typography>
                    </ListItemIcon>
                    <ListItemText
                      primary={item}
                      primaryTypographyProps={{ variant: "body2" }}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontStyle: "italic", lineHeight: 1.8 }}
          >
            To exercise any of these rights, please contact us at
            privacy@eduwingz.com with your request details.
          </Typography>
        </PolicySection>

        {/* 7. Policy Updates */}
        <PolicySection icon={RefreshOutlined} title="Policy Updates">
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
            We may update this Privacy Policy periodically. Changes are
            effective when posted on this page. We will notify you of any
            material changes via email or through our platform. Please review
            this policy regularly to stay informed about how we protect your
            privacy.
          </Typography>
        </PolicySection>

        {/* Contact Section */}
        <Divider sx={{ my: 6 }} />
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
              Have Privacy Concerns?
            </Typography>

            <Typography
              variant="h6"
              sx={{ color: "secondary.contrastText", mb: 4 }}
            >
              Contact our privacy team at privacy@eduwingz.com or through your
              account settings.
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
              href="/contact"
            >
              Contact Us
            </Button>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default PrivacyPage;
