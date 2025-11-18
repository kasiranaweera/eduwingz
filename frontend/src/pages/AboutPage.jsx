import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  FilterCenterFocus,
  School,
  ChatBubbleOutline,
  TrendingUp,
  Visibility,
  Explore,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Motion components
const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionTypography = motion(Typography);

// Section Header Component
const SectionHeader = ({ title, subtitle }) => {
  const theme = useTheme();
  return (
    <Box sx={{ textAlign: 'center', mb: 6 }}>
      <MotionTypography
        variant="overline"
        sx={{
          color: theme.palette.primary.main,
          fontWeight: 600,
          letterSpacing: 2,
          display: 'block',
          mb: 2,
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {subtitle}
      </MotionTypography>
      <MotionTypography
        variant="h3"
        component="h2"
        sx={{
          fontWeight: 700,
          mt: 2,
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #ff9800 0%, #ffc107 100%)'
            : 'linear-gradient(135deg, #ff9800 0%, #ffc107 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {title}
      </MotionTypography>
    </Box>
  );
};

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description, index }) => {
  const theme = useTheme();

  return (
    <MotionCard
      sx={{
        height: '100%',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, rgba(255, 152, 0, 0.05) 0%, rgba(255, 193, 7, 0.05) 100%)'
          : 'linear-gradient(135deg, rgba(255, 152, 0, 0.02) 0%, rgba(255, 193, 7, 0.02) 100%)',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: `0 8px 32px ${theme.palette.primary.main}30`,
          transform: 'translateY(-8px)',
          borderColor: theme.palette.primary.main,
        },
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            mb: 2,
          }}
        >
          <Icon sx={{ color: 'white', fontSize: 32 }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            lineHeight: 1.6,
          }}
        >
          {description}
        </Typography>
      </CardContent>
    </MotionCard>
  );
};

// Intro Section
const IntroSection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <MotionBox
      component="section"
      sx={{
        py: { xs: 6, md: 10 },
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
          : 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background blur effect */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: '10%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: `${theme.palette.primary.main}30`,
          filter: 'blur(80px)',
          opacity: 0.3,
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          right: '10%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: `${theme.palette.secondary.main}30`,
          filter: 'blur(80px)',
          opacity: 0.3,
          zIndex: 0,
        }}
      />

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Typography
            variant="overline"
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 600,
              letterSpacing: 2,
              display: 'block',
              mb: 2,
              textAlign: 'center',
            }}
          >
            ABOUT US
          </Typography>
          <Typography
            variant={isMobile ? 'h4' : 'h2'}
            component="h1"
            sx={{
              fontWeight: 800,
              textAlign: 'center',
              mb: 3,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #ff9800 0%, #ffc107 100%)'
                : 'linear-gradient(135deg, #ff9800 0%, #ffc107 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            About EduWingz
          </Typography>
          <Typography
            variant="h6"
            sx={{
              textAlign: 'center',
              mb: 4,
              color: theme.palette.text.secondary,
              lineHeight: 1.8,
              maxWidth: '100%',
            }}
          >
            EduWingz is an AI-powered teaching assistant designed to make learning smarter, more personal, and more engaging. Our platform understands how each student learns and delivers lessons in the style that suits them best.
          </Typography>

          {/* Visual Banner */}
          <Paper
            sx={{
              py: 8,
              px: 3,
              borderRadius: 3,
              background: theme.palette.mode === 'dark'
                ? 'rgba(255, 152, 0, 0.05)'
                : 'rgba(255, 152, 0, 0.02)',
              border: `2px dashed ${theme.palette.primary.main}50`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 200,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                textAlign: 'center',
              }}
            >
              Illustrative Banner Placeholder
            </Typography>
          </Paper>
        </MotionBox>
      </Container>
    </MotionBox>
  );
};

// Why Section
const WhySection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 6, md: 10 },
        background: theme.palette.background.paper,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          {/* Left Visual */}
          <Grid item xs={12} md={6} sx={{ order: isMobile ? 2 : 1 }}>
            <MotionBox
              sx={{
                position: 'relative',
                height: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Paper
                sx={{
                  width: '90%',
                  height: '90%',
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
                  border: `1px solid ${theme.palette.primary.main}50`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Explore sx={{ fontSize: 80, color: theme.palette.primary.main, opacity: 0.6 }} />
              </Paper>
            </MotionBox>
          </Grid>

          {/* Right Content */}
          <Grid item xs={12} md={6} sx={{ order: isMobile ? 1 : 2 }}>
            <MotionBox
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <SectionHeader title="Why We Created EduWingz" subtitle="Our Mission" />
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.8,
                  color: theme.palette.text.secondary,
                  mb: 2,
                }}
              >
                Today's classrooms are full, diverse, and fast-moving — but every student deserves individual support. We built EduWingz to bridge this gap by combining AI with modern teaching methods. Our goal is simple: help students learn in the way that feels natural to them, while giving teachers a tool that supports, not replaces, their work.
              </Typography>
            </MotionBox>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

// Features Section
const FeaturesSection = () => {
  const theme = useTheme();

  const features = [
    {
      icon: FilterCenterFocus,
      title: "Identify Learning Styles",
      description: "Accurately pinpoint the best way a student processes information and learns.",
    },
    {
      icon: School,
      title: "Personalized Lessons",
      description: "Content is dynamically transformed to match the user's preferences and pace.",
    },
    {
      icon: ChatBubbleOutline,
      title: "Real-time AI Assistance",
      description: "Instant explanations, feedback, and guidance through integrated, conversational support.",
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Clear metrics on the learning journey with clean, actionable insights.",
    },
  ];

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 6, md: 10 },
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
          : 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
      }}
    >
      <Container maxWidth="lg">
        <SectionHeader title="What EduWingz Can Do" subtitle="Key Features" />

        <MotionBox
          sx={{ textAlign: 'center', mb: 6 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.secondary,
              maxWidth: 500,
              mx: 'auto',
              lineHeight: 1.8,
            }}
          >
            EduWingz adapts to each learner using the VARK model (Visual, Auditory, Reading/Writing, Kinesthetic).
          </Typography>
        </MotionBox>

        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={6} key={index}>
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                index={index}
              />
            </Grid>
          ))}
        </Grid>

        <MotionBox
          sx={{ textAlign: 'center', mt: 6 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
            }}
          >
            All of this creates a smoother, more enjoyable learning experience.
          </Typography>
        </MotionBox>
      </Container>
    </Box>
  );
};

// Vision Section
const VisionSection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 6, md: 10 },
        background: theme.palette.background.paper,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          {/* Left Content */}
          <Grid item xs={12} md={6}>
            <MotionBox
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <SectionHeader title="Our Vision and Promise" subtitle="The Path Forward" />

              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    color: theme.palette.primary.main,
                  }}
                >
                  Our Vision
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    lineHeight: 1.8,
                    color: theme.palette.text.secondary,
                  }}
                >
                  We aim to create a world where every learner has access to a personal teaching assistant, no matter where they are. Education should not be limited by classroom size, teaching resources, or one-size-fits-all methods. With EduWingz, we move toward a future where learning is flexible, inclusive, and personalized for everyone.
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    color: theme.palette.primary.main,
                  }}
                >
                  Our Promise
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    lineHeight: 1.8,
                    color: theme.palette.text.secondary,
                  }}
                >
                  EduWingz will continue to evolve — smarter teaching methods, richer content, better analytics, and more personalized experiences. We are committed to building a solution that truly helps students learn better and teachers teach smarter.
                  <br />
                  <br />
                  <strong>EduWingz — Learning that understands you.</strong>
                </Typography>
              </Box>
            </MotionBox>
          </Grid>

          {/* Right Visual */}
          <Grid item xs={12} md={6} sx={{ order: isMobile ? -1 : 0 }}>
            <MotionBox
              sx={{
                position: 'relative',
                height: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Paper
                sx={{
                  width: '90%',
                  height: '90%',
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
                  border: `1px solid ${theme.palette.primary.main}50`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Visibility sx={{ fontSize: 80, color: theme.palette.primary.main, opacity: 0.6 }} />
              </Paper>
            </MotionBox>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

// CTA Section
const CtaSection = () => {
  const theme = useTheme();

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 6, md: 10 },
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
          : 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
      }}
    >
      <Container maxWidth="sm">
        <MotionBox
          component={Paper}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            textAlign: 'center',
            boxShadow: `0 8px 32px ${theme.palette.primary.main}50`,
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          whileHover={{ scale: 1.02 }}
        >
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: 'white',
            }}
          >
            Ready to Transform Learning?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 4,
              color: 'rgba(255, 255, 255, 0.9)',
              lineHeight: 1.8,
            }}
          >
            Join the thousands of students and educators who are already experiencing personalized, AI-powered education.
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              background: 'white',
              color: theme.palette.primary.main,
              fontWeight: 700,
              px: 4,
              py: 1.5,
              borderRadius: 50,
              transition: 'all 0.3s ease',
              '&:hover': {
                background: '#f5f5f5',
                transform: 'scale(1.05)',
              },
              '&:active': {
                transform: 'scale(0.95)',
              },
            }}
            onClick={() => console.log('CTA button clicked')}
          >
            Get Started Today
          </Button>
        </MotionBox>
      </Container>
    </Box>
  );
};

// Footer Component
const PageFooter = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        textAlign: 'center',
        background: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
        &copy; {new Date().getFullYear()} EduWingz. All rights reserved.
      </Typography>
    </Box>
  );
};

// Main About Page
const AboutPage = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.background.default,
      }}
    >
      <main>
        <IntroSection />
        <WhySection />
        <FeaturesSection />
        <VisionSection />
        <CtaSection />
      </main>
      <PageFooter />
    </Box>
  );
};

export default AboutPage;


