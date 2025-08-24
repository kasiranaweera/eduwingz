import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Paper,
  Rating,
  Stack,
  TableContainer,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import FeedbackCard from "../components/FeedbackCard";
import ObjectCard from "../components/ObjectCard";
import { Link } from "react-router-dom";
import hero_img from "../assets/img/hero.png";
import bgImageDark from "../assets/img/main_dbg_img_1.png";
import bgImageLight from "../assets/img/main_lbg_img_1.png";
import uiConfig from "../configs/ui.config";
import Particles from "../components/common/Particles";
import { themeModes } from "../configs/theme.config";
import { useSelector } from "react-redux";
import gradientImageDark from "../assets/img/Gradient_2_dark.png";
import gradientImageLight from "../assets/img/Gradient_2_light.png";
import gradientHalfImageLight from "../assets/img/Gradient_3_light.png";
import gradientHalfImageDark from "../assets/img/Gradient_3_dark.png";
import contentData from "../assets/contentData.js";
import Image3D from "../assets/img/3d-image_2.jpg";
import { useState } from "react";
import { LoadingButton } from "@mui/lab";
import FloatingElement from "../components/common/FloatingElement";
import DarkVeil from "../components/common/DarkVeil";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Grid } from "@mui/system";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import FilterTiltShiftIcon from "@mui/icons-material/FilterTiltShift";
import TimelineIcon from "@mui/icons-material/Timeline";
import PsychologyIcon from "@mui/icons-material/Psychology"; // for Smart Learning Assistant
import TrackChangesIcon from "@mui/icons-material/TrackChanges"; // for Adaptive Curriculum
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"; // for Progress Tracking
import LightbulbIcon from "@mui/icons-material/Lightbulb"; // for Interactive Lessons
import GroupIcon from "@mui/icons-material/Group";

const feedbackData = [
  {
    username: "Ashika Ishan",
    comment:
      "EduWingz completely transformed how I study. The system quickly figured out that I'm a visual learner and started presenting content with diagrams and videos...",
    starcount: 3,
  },
];

const HomePage = () => {
  const { themeMode } = useSelector((state) => state.themeMode);
  const theme = useTheme();
  const [value, setValue] = useState(0);
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    responsive: [
      {
        breakpoint: 900,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const steps = [
    {
      icon: MenuBookIcon,
      title: "Choose Your Subject",
      desc: "Select from our comprehensive library of courses or let our AI recommend the perfect learning path for your goals.",
    },
    {
      icon: FilterTiltShiftIcon,
      title: "AI Personalizes Content",
      desc: "Our AI analyzes your learning style and creates personalized lessons, exercises, and study materials just for you.",
    },
    {
      icon: TimelineIcon,
      title: "Track Progress & Grow",
      desc: "Monitor your learning progress with detailed analytics and celebrate achievements as you master new skills.",
    },
  ];

  const features = [
    {
      icon: PsychologyIcon,
      title: "Smart Learning Assistant",
      desc: "AI tutor that understands your learning style and provides personalized guidance and support.",
    },
    {
      icon: TrackChangesIcon,
      title: "Adaptive Curriculum",
      desc: "Dynamic course content that adjusts to your progress and learning preferences in real-time.",
    },
    {
      icon: EmojiEventsIcon,
      title: "Progress Tracking",
      desc: "Comprehensive analytics to monitor your learning journey and celebrate your achievements.",
    },
    {
      icon: LightbulbIcon,
      title: "Interactive Lessons",
      desc: "Engaging multimedia content with interactive exercises and real-world applications.",
    },
    {
      icon: GroupIcon,
      title: "Collaborative Learning",
      desc: "Connect with peers and participate in group projects and discussions guided by AI.",
    },
  ];

  return (
    <Box className="section" sx={{ p: 0, m: 0 }}>
      <Box
        sx={
          {
            // backgroundImage:
            //   themeMode === themeModes.dark
            //     ? `url(${bgImageDark})`
            //     : `url(${bgImageLight})`,
            // backgroundSize: "cover",
            // height: "100vh",
            // position: "relative", // Add this to make absolute positioning work
          }
        }
      >
        <Box
          sx={{
            width: "100%",
            height: { md: "800px", xs: "700px", sm: "550px" },
            position: "absolute",
          }}
        >
          {themeMode === themeModes.dark ? <DarkVeil /> : <></>}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1,
            }}
          >
            <Particles />
          </Box>
        </Box>

        {/* Your content section with a higher z-index to appear above particles */}
        <Box sx={{ position: "relative", zIndex: 2 }}>
          {/* Hero Section */}
          <Container
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              py: { md: 10, xs: 5 },
            }}
          >
            <Stack
              spacing={{ md: 5, xs: 2 }}
              sx={{
                backdropFilter: `blur(1px)`,
                py: 3,
                px: 5,
                borderRadius: 3,
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <FloatingElement label="🎓 Transform YourLearning Experience Today!" />
              </Box>
              <Box>
                <Typography
                  variant={isMdUp ? "h3" : "h4"}
                  sx={{ fontWeight: 500, textAlign: "center" }}
                >
                  AI-Powered Learning Can Revolutionize <br /> Your Education
                </Typography>
                <Box sx={{ justifyContent: "center", display: "flex", mt: 2 }}>
                  <Typography
                    variant={isMdUp ? "h1" : "h2"}
                    sx={{
                      fontWeight: 600,
                      fontFamily: "Russo One",
                      background: uiConfig.style.mainGradient.color,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      textAlign: "center",
                    }}
                  >
                    EduWingz
                  </Typography>
                </Box>
                <Typography
                  variant={isMdUp ? "h4" : "h5"}
                  sx={{ fontWeight: 600, textAlign: "center" }}
                >
                  AI-Powered Teaching Assistant
                </Typography>
              </Box>
              <Typography
                sx={{ textAlign: "center" }}
                variant={isMdUp ? "h6" : "body2"}
              >
                Experience personalized education with our AI teaching assistant
                that adapts to Your learning style, tracks your progress, and
                provides customized lessons for optimal learning outcomes.
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: { md: 2, xs: 1 },
                  alignItems: "center",
                  flexDirection: { md: "row", xs: "column" },
                }}
              >
                <Button
                  sx={{
                    background: uiConfig.style.mainGradient.color,
                    py: 1,
                    px: 3,
                    borderRadius: 100,
                    color: "secondary.contrastText",
                    "&:hover": {},
                  }}
                  component={Link}
                  to="/main"
                  size="small"
                >
                  Start Your Journey
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    py: 1,
                    px: 3,
                    borderRadius: 100,
                    color: "primary.contrastText",
                    "&:hover": { color: "primary.main" },
                  }}
                  component={Link}
                  to="/"
                  size="small"
                >
                  Demo Video
                </Button>
              </Box>
            </Stack>
            {/* <Box sx={{ width: "40%" }}>
              <img
                style={{ transform: "scaleX(-1)" }}
                src={hero_img}
                alt="hero_img"
                width="100%"
              />
            </Box> */}
          </Container>
        </Box>
      </Box>

      {/* <Box sx={{ width: "100vw", height: "100vh", bgcolor: "#000" }}>
      <Particles
      />
    </Box> */}

      <Container>
        {/* intro */}
        <Box sx={{ mt: 15, mb: 5 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography
              variant={isMdUp ? "h3" : "h4"}
              sx={{ textAlign: "center", fontWeight: "600" }}
            >
              Why
            </Typography>
            <Typography
              variant={isMdUp ? "h3" : "h4"}
              sx={{
                textAlign: "center",
                fontWeight: "600",
                background: uiConfig.style.mainGradient.color,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              EduWingz?
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { md: "row", xs: "column" },
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              mt: 5,
            }}
          >
            <Box sx={{ width: "100%" }}>
              <Typography
                variant={isMdUp ? "h6" : "body1"}
                sx={{ textAlign: "center", fontWeight: "400" }}
              >
                Using advanced AI technology to create personalized learning
                experiences that adapt to your unique learning style, pace, and
                goals for maximum educational impact.
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(12, 1fr)",
                  gap: 3,
                  mt: 5,
                }}
              >
                <Box
                  sx={{
                    gridColumn: { md: "span 6", xs: "span 6", sm: "span 6" },
                    p: 3,
                    borderLeft: 1,
                    borderBottom: 1,
                    borderColor: "primary.main",
                    borderRadius: 5,
                    "&:hover": {
                      borderTop: 1,
                      borderRight: 1,
                      borderColor: "primary.main",
                      color: "primary.main",
                      transition: "0.3s",
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  <Typography
                    variant={isMdUp ? "h6" : "body1"}
                    sx={{ fontWeight: 300, textAlign: "center" }}
                  >
                    Learning with Personalized Contents
                  </Typography>
                </Box>
                <Box
                  sx={{
                    gridColumn: { md: "span 6", xs: "span 6", sm: "span 6" },
                    p: 3,
                    borderLeft: 1,
                    borderBottom: 1,
                    borderColor: "primary.main",
                    borderRadius: 5,
                    "&:hover": {
                      borderTop: 1,
                      borderRight: 1,
                      borderColor: "primary.main",
                      color: "primary.main",
                      transition: "0.3s",
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  <Typography
                    variant={isMdUp ? "h6" : "body1"}
                    sx={{ fontWeight: 300, textAlign: "center" }}
                  >
                    Adaptive Assessment & Guidance
                  </Typography>
                </Box>
                <Box
                  sx={{
                    gridColumn: { md: "span 6", xs: "span 6", sm: "span 6" },
                    p: 3,
                    borderLeft: 1,
                    borderBottom: 1,
                    borderColor: "primary.main",
                    borderRadius: 5,
                    "&:hover": {
                      borderTop: 1,
                      borderRight: 1,
                      borderColor: "primary.main",
                      color: "primary.main",
                      transition: "0.3s",
                      transform: "scale(1.05)",
                      boxShadow: 5,
                    },
                  }}
                >
                  <Typography
                    variant={isMdUp ? "h6" : "body1"}
                    sx={{ fontWeight: 300, textAlign: "center" }}
                  >
                    24/7 AI Assistant Teacher & Support
                  </Typography>
                </Box>
                <Box
                  sx={{
                    gridColumn: { md: "span 6", xs: "span 6", sm: "span 6" },
                    p: 3,
                    borderLeft: 1,
                    borderBottom: 1,
                    borderColor: "primary.main",
                    borderRadius: 5,
                    "&:hover": {
                      borderTop: 1,
                      borderRight: 1,
                      borderColor: "primary.main",
                      color: "primary.main",
                      transition: "0.3s",
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  <Typography
                    variant={isMdUp ? "h6" : "body1"}
                    sx={{ fontWeight: 300, textAlign: "center" }}
                  >
                    Solutions for Your Education Problems
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "end", mt: 3 }}>
                <Button
                  variant="text"
                  sx={{
                    fontWeight: 300,

                    color: "primary.contrastText",
                    "&:hover": { color: "primary.main" },
                  }}
                  component={Link}
                  to="/about"
                  endIcon={<ArrowForwardIcon />}
                >
                  See More
                </Button>
              </Box>
            </Box>
            <Box sx={{ width: "60%" }}>
              <img
                style={{ transform: "scaleX(-1)" }}
                src={hero_img}
                alt="hero_img"
                width="100%"
              />
            </Box>
          </Box>
          <Box sx={{}}>
            <img
              style={{ transform: "scaleX(-1)" }}
              src={
                themeMode === themeModes.dark
                  ? gradientImageDark
                  : gradientImageLight
              }
              alt="gradientImage"
              width="100%"
            />
          </Box>
        </Box>

        {/* Steps */}
        <Box
          sx={{
            mt: 15,
            mb: 10,
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: 3,
          }}
        >
          {/* Left Side */}
          <Box sx={{ gridColumn: { md: "span 8", xs: "span 12" } }}>
            <Typography
              variant={isMdUp ? "h3" : "h4"}
              fontWeight="bold"
              gutterBottom
              sx={{ color: "primary.ContrastText" }}
            >
              Building Your Learning <br /> Journey Is Easy
            </Typography>

            <Box mt={5}>
              {steps.map((item, index) => (
                <Box
                  key={index}
                  display="flex"
                  alignItems="flex-start"
                  mb={3}
                  sx={{
                    transition: "transform 0.3s",
                    "&:hover .iconBox": { transform: "scale(1.1)" },
                  }}
                >
                  {/* Icon Circle */}
                  <Box
                    className="iconBox"
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: uiConfig.style.mainGradient.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      mt: "4px",
                      transition: "0.3s",
                    }}
                  >
                    <item.icon size={18} color="primary.ContrastText" />
                  </Box>

                  {/* Text */}
                  <Box ml={2}>
                    <Typography
                      variant={isMdUp ? "h6" : "body1"}
                      fontWeight="600"
                      sx={{ color: "primary.contrastText" }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      variant={isMdUp ? "body1" : "body2"}
                      sx={{ color: "primary.contrastText" }}
                    >
                      {item.desc}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Right Side */}
          <Box
            sx={{
              gridColumn: { md: "span 4", xs: "span 12" },
              justifyContent: "center",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Box
                position="relative"
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {/* Outer Pulse */}
                <Box
                  sx={{
                    width: 256,
                    height: 256,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    animation: "pulse 2s infinite",
                    background:
                      themeMode === themeModes.dark
                        ? "linear-gradient(to right, rgba(255,152,0,0.2), rgba(255,193,7,0.2))"
                        : "linear-gradient(to right, rgba(255,152,0,0.1), rgba(255,193,7,0.1))",
                  }}
                >
                  {/* Inner Circle */}
                  <Box
                    sx={{
                      width: 192,
                      height: 192,
                      borderRadius: "50%",
                      background: "linear-gradient(to right, #ff9800, #ffc107)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: 6,
                    }}
                  >
                    <Typography
                      variant="h2"
                      sx={{ animation: "bounce 2s infinite" }}
                    >
                      🎓
                    </Typography>
                  </Box>
                </Box>

                {/* Floating Badge */}
                <Paper
                  elevation={4}
                  sx={{
                    position: "absolute",
                    top: -16,
                    right: -16,
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "linear-gradient(to right, #ff9800, #ffc107)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    animation: "bounce 2s infinite",
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight="bold"
                    sx={{ color: "#fff" }}
                  >
                    Learn!
                  </Typography>
                </Paper>
              </Box>
            </Box>
          </Box>

          {/* Animations */}
          <style>
            {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.1); opacity: 1; }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
        `}
          </style>
        </Box>

        {/* Features */}
        <Box sx={{ position: "relative" }}>
          <Box sx={{ position: "absolute", top: 0 }}>
            <img
              style={{ transform: "scaleY(-1)" }}
              src={
                themeMode === themeModes.dark
                  ? gradientImageDark
                  : gradientImageLight
              }
              alt="gradientImage"
              width="100%"
            />
          </Box>
          <Box sx={{ mb: 5, position: "relative", zIndex: 1, pt: 15 }}>
            <Box
              sx={{
                display: { md: "flex", xs: "block" },
                justifyContent: "center",
                alignItems: "center",
                gap: 2,
                mb: 5,
              }}
            >
              <Typography
                variant={isMdUp ? "h3" : "h4"}
                sx={{ textAlign: "center", fontWeight: "600" }}
              >
                Empower Your
              </Typography>
              <Typography
                variant={isMdUp ? "h3" : "h4"}
                sx={{
                  textAlign: "center",
                  fontWeight: "600",
                  background: uiConfig.style.mainGradient.color,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Learning With AI
              </Typography>
            </Box>
            <Typography
              variant={isMdUp ? "h6" : "body1"}
              sx={{ textAlign: "center", my: 5, fontWeight: "400" }}
            >
              Transform your educational journey with AI-powered tools that
              provide personalized instruction, intelligent feedback, and
              adaptive learning experiences tailored to your unique needs.
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(12, 1fr)",
                gap: 3,
              }}
            >
              {features.map((feature, index) => (
                <Box
                  sx={{
                    gridColumn: { md: "span 4", xs: "span 12", sm: "span 6" },
                    p: 0,
                  }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      transition: "all 0.3s",
                      transform: "translateY(0px)",
                      "&:hover": {
                        boxShadow: 5,
                        transform: "translateY(-5px)",
                        borderTop: 1,
                        borderRight: 1,
                        borderColor: "primary.main",
                      },
                      bgcolor:
                        themeMode === themeModes.dark
                          ? "grey.900"
                          : "background.paper",
                      borderBottom: 1,
                      borderLeft: 1,
                      borderColor: "primary.main",
                      borderRadius: 5,
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 2,
                            background:
                              "linear-gradient(90deg, #ff9800, #ffc107)",
                            boxShadow: 3,
                            transition: "transform 0.3s",
                            "&:hover": { transform: "scale(1.1)" },
                          }}
                        >
                          <feature.icon sx={{ fontSize: 22, color: "#fff" }} />
                        </Box>
                        <Typography
                          variant={isMdUp ? "h6" : "body1"}
                          fontWeight={600}
                          ml={2}
                          color={
                            themeMode === themeModes.dark
                              ? "common.white"
                              : "text.primary"
                          }
                        >
                          {feature.title}
                        </Typography>
                      </Box>
                      <Typography
                        variant={isMdUp ? "body1" : "body2"}
                        color={
                          themeMode === themeModes.dark
                            ? "grey.300"
                            : "text.secondary"
                        }
                      >
                        {feature.desc}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>

            {/* <Box>
            <Stack
              direction="row"
              spacing={2.5}
              sx={{ justifyContent: "center" }}
            >
              <ObjectCard />
            </Stack>
          </Box> */}
          </Box>
        </Box>
      </Container>

      {/* reviews */}
      <Box sx={{ mb: 15 }}>
        <Box sx={{ position: "relative" }}>
          <Box sx={{ alignContent: "space-between" }}>
            {/* <img
              style={{ transform: "scaleY(-1)" }}
              src={
                themeMode === themeModes.dark
                  ? gradientImageDark
                  : gradientImageLight
              }
              alt="gradientImage"
              width="100%"
            /> */}
          </Box>
          <Container
            sx={{
              mt: 10,
              pb: 15,
              position: "relative",
              // top: 0,
              // left: 0,
              // right: 0,
              // bottom: 0,
              zIndex: 1,
            }}
          >
            <Box>
              <Box
                sx={{
                  display: "flow",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Typography
                  variant={isMdUp ? "h3" : "h4"}
                  sx={{ textAlign: "center", fontWeight: "600" }}
                >
                  Hear What Our Students
                </Typography>
                <Typography
                  variant={isMdUp ? "h3" : "h4"}
                  sx={{
                    textAlign: "center",
                    fontWeight: "600",
                    background: uiConfig.style.mainGradient.color,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Say About Us
                </Typography>
              </Box>
              {/* <Typography
                variant="h5"
                sx={{ textAlign: "center", fontWeight: "500", mt: 0 }}
              >
                - TESTIMONIALS -
              </Typography> */}
            </Box>
            <Box sx={{ m: { sm: 5 , xs:10} }}>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(12, 1fr)",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                mt: 10,
                gap: 3,
              }}
            >
              {/* <Stack
                direction="row"
                spacing={3}
                mt={5}
                sx={{ justifyContent: "center",width:'100%',}}
              >
                {contentData.studentTestimonials.map((item, index) => 
                  <FeedbackCard
                  name={item[index].username}
                  comment={item[index].testimonial}
                  stars={item[index].rating}
                />
                )}
              </Stack> */}
              {contentData.studentTestimonials.map((item, index) => (
                <FeedbackCard
                  name={item.username}
                  comment={item.testimonial}
                  stars={item.rating}
                />
              ))}
            </Box></Box>
          </Container>
          <Box
            sx={{
              display: "flex",
              position: "absolute",
              bottom: 0,
              width: "100%",
            }}
          >
            <img
              style={{ transform: "scaleX(-1)" }}
              src={
                themeMode === themeModes.dark
                  ? gradientHalfImageDark
                  : gradientHalfImageLight
              }
              alt="gradientHalfImage"
              width="100%"
            />
            <img
              src={
                themeMode === themeModes.dark
                  ? gradientHalfImageDark
                  : gradientHalfImageLight
              }
              alt="gradientHalfImage"
              width="100%"
            />
          </Box>
        </Box>
      </Box>

      {/* Experience */}
      <Box sx={{ position: "relative" }}>
        <Container
          sx={{
            position: "relative",
            zIndex: 1,
            mb: 15,
          }}
        >
          <Box>
            <Typography
              variant={isMdUp ? "h3" : "h4"}
              sx={{ textAlign: "center", fontWeight: "600" }}
            >
              Ready to Transform
            </Typography>
            <Box
              sx={{
                display: { md: "flex", xs: "block", sm: "flex" },
                justifyContent: "center",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Typography
                variant={isMdUp ? "h3" : "h4"}
                sx={{ textAlign: "center", fontWeight: "600" }}
              >
                Your
              </Typography>

              <Typography
                variant={isMdUp ? "h3" : "h4"}
                sx={{
                  textAlign: "center",
                  fontWeight: "600",
                  background: uiConfig.style.mainGradient.color,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Learning Experience?
              </Typography>
            </Box>
            <Box
              sx={{
                mt: 5,
                display: "grid",
                gridTemplateColumns: "repeat(12, 1fr)",
                alignItems: "stretch",
                justifyContent: "center",
                gap: 3,
              }}
            >
              <Box
                sx={{
                  gridColumn: { md: "span 6", xs: "span 12", sm: "span 12" },
                  backgroundColor: "graycolor.one",
                  borderRadius: 5,
                  p: 3,
                  borderBottom: 1,
                  borderLeft: 1,
                  borderColor: "primary.main",
                }}
              >
                <Box sx={{ position: "relative" }}>
                  <img
                    src={Image3D}
                    alt="Image3D"
                    width="100%"
                    style={{ borderRadius: "15px" }}
                  />

                  <Box
                    sx={{
                      position: "absolute",
                      top: "90%",
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 1,
                      height: "75px",
                      background:
                        themeMode === themeModes.dark
                          ? "linear-gradient(0deg, #313131, #121212, #12121200)"
                          : "linear-gradient(0deg, #eeeeee, #fafafa, #fafafa00)",
                      backdropFilter: `blur(5px)`,
                    }}
                  >
                    <Box
                      sx={{
                        textAlign: "center",
                        mt: 3,
                        color: "primary.contrastText",
                      }}
                    >
                      <Typography
                        variant={isMdUp ? "h5" : "h6"}
                        sx={{ fontWeight: "600" }}
                      >
                        Join to EduWingz Today;
                      </Typography>
                      <Typography
                        variant={isMdUp ? "h6" : "body1"}
                        sx={{ fontWeight: "600" }}
                      >
                        Discover education tailored specifically to you.
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ justifyContent: "center", display: "flex", mt: 8 }}>
                  <Button
                    sx={{
                      backgroundColor: "graycolor.two",
                      py: 1,
                      px: 3,
                      borderRadius: 100,
                      color: "primary.contrastText",
                      "&:hover": { color: "primary.main" },
                    }}
                    component={Link}
                    to="/main"
                  >
                    Start Learning Now
                  </Button>
                </Box>
              </Box>
              <Box
                sx={{
                  gridColumn: { md: "span 6", xs: "span 12", sm: "span 12" },
                  backgroundColor: "graycolor.one",
                  borderRadius: 5,
                  p: 3,
                  borderBottom: 1,
                  borderLeft: 1,
                  borderColor: "primary.main",
                }}
              >
                <Typography
                  variant={isMdUp ? "h5" : "h6"}
                  sx={{ fontWeight: "600" }}
                >
                  Your Feedback Is Important For Us
                </Typography>
                <Stack sx={{ mt: 5 }} spacing={3}>
                  <TextField
                    type="text"
                    placeholder="Enter your name"
                    name="username"
                    label="Usename"
                    fullWidth
                    // value={signinForm.values.email}
                    // onChange={signinForm.handleChange}
                    // error={
                    //   signinForm.touched.email &&
                    //   signinForm.errors.email !== undefined
                    // }
                    // helperText={
                    //   signinForm.touched.email && signinForm.errors.email
                    // }
                    sx={{}}
                    required
                  />
                  <TextField
                    type="text"
                    placeholder="Enter your email"
                    name="email"
                    label="Email"
                    fullWidth
                    // value={signinForm.values.email}
                    // onChange={signinForm.handleChange}
                    // error={
                    //   signinForm.touched.email &&
                    //   signinForm.errors.email !== undefined
                    // }
                    // helperText={
                    //   signinForm.touched.email && signinForm.errors.email
                    // }
                    sx={{}}
                    required
                  />
                  <TextField
                    type="text"
                    placeholder="Type your massage..."
                    name="Feedback"
                    label="Feedback"
                    fullWidth
                    multiline
                    rows={7}
                    // value={signinForm.values.email}
                    // onChange={signinForm.handleChange}
                    // error={
                    //   signinForm.touched.email &&
                    //   signinForm.errors.email !== undefined
                    // }
                    // helperText={
                    //   signinForm.touched.email && signinForm.errors.email
                    // }
                    sx={{}}
                    required
                  />
                  <Box>
                    <Typography>How would you rate our output</Typography>
                    <Rating
                      name="simple-controlled"
                      value={value}
                      onChange={(event, newValue) => {
                        setValue(newValue);
                      }}
                    />
                  </Box>
                </Stack>
                <LoadingButton
                  type="submit"
                  fullWidth
                  size="large"
                  variant="contained"
                  // loading={isLoginRequest}
                  sx={{
                    background: uiConfig.style.mainGradient.color,
                    mt: 4,
                    borderRadius: 100,
                    color: "secondary.contrastText",
                  }}
                >
                  Submit My Message
                </LoadingButton>
              </Box>
            </Box>
          </Box>
        </Container>
        <Box sx={{ position: "absolute", bottom: -150, width: "100%" }}>
          <img
            src={
              themeMode === themeModes.dark
                ? gradientImageDark
                : gradientImageLight
            }
            alt="gradientImage"
            width="100%"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;
