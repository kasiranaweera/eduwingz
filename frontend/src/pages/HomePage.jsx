import {
  Box,
  Button,
  Container,
  Divider,
  Rating,
  Stack,
  TableContainer,
  TextField,
  Typography,
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
import uiConfigs from "../configs/ui.config";

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
  const [value, setValue] = useState(0);

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

  return (
    <Box className="section" sx={{ p: 0, m: 0 }}>
      <Box
        sx={{
          backgroundImage:
            themeMode === themeModes.dark
              ? `url(${bgImageDark})`
              : `url(${bgImageLight})`,
          backgroundSize: "cover",
          height: "100vh",
          position: "relative", // Add this to make absolute positioning work
        }}
      >
        {/* Position the Particles absolutely to cover the entire container */}
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

        {/* Your content section with a higher z-index to appear above particles */}
        <Box sx={{ position: "relative", zIndex: 2 }}>
          {/* Hero Section */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 15,
              py: 10,
            }}
          >
            <Stack
              spacing={5}
              sx={{
                width: "40%",
                backdropFilter: `blur(5px)`,
                p: 3,
                borderRadius: 3,
              }}
            >
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 600 }}>
                  Transform Learning with
                </Typography>
                <Box sx={{ width: "75%" }}>
                  <Typography
                    variant="h1"
                    sx={{
                      fontWeight: 600,
                      fontFamily: "Russo One",
                      background: uiConfig.style.mainGradient.color,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    EduWingz
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 600 }}>
                  Your AI-Powered <br /> Teaching Assistant
                </Typography>
              </Box>
              <Typography variant="h6">
                Personalized education that adapts to each student's unique
                learning style. So Welcome and Start your journey with
                EduWingz...
              </Typography>
              <Box>
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
                  Experience Personalized Learning
                </Button>
              </Box>
            </Stack>
            <Box sx={{ width: "40%" }}>
              <img
                style={{ transform: "scaleX(-1)" }}
                src={hero_img}
                alt="hero_img"
                width="100%"
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* <Box sx={{ width: "100vw", height: "100vh", bgcolor: "#000" }}>
      <Particles
      />
    </Box> */}

      <Container>
        {/* intro */}
        <Box sx={{ mt: 0, mb: 5 }}>
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
              Introducing
            </Typography>
            <Typography
              variant="h3"
              sx={{
                textAlign: "center",
                fontWeight: "600",
                background: uiConfig.style.mainGradient.color,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              EduWingz
            </Typography>
          </Box>

          <Box sx={{ pt: 4 }}>
            <Typography
              variant="h6"
              sx={{ textAlign: "center", fontWeight: "300" }}
            >
              In the modern realm of education, the increasing problem of giving
              equal attention to every student has become quite apparent. Our
              project, EduWingz, introduces an AI-powered teaching assistant
              that revolutionizes the traditional learning experience by
              offering personalized, adaptive support to students. This
              innovation addresses the fundamental challenge of scaling
              individualized education while maintaining quality and
              effectiveness.
            </Typography>
            <Divider sx={{ my: 3 }} />

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                spacing: 12,
                justifyContent: "center",
              }}
            >
              <Stack direction={"row"} spacing={3}>
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
                  Get Start Now
                </Button>
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
                  Download for Desktop
                </Button>
              </Stack>
            </Box>
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

        {/* Featuers */}
        <Box sx={{ my: 15 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
              my: 5,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                textAlign: "center",
                fontWeight: "600",
                background: uiConfig.style.mainGradient.color,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Features
            </Typography>
            <Typography
              variant="h3"
              sx={{ textAlign: "center", fontWeight: "600" }}
            >
              Behind EduWingz
            </Typography>
          </Box>

          <Box>
            <Stack
              direction="row"
              spacing={2.5}
              sx={{ justifyContent: "center" }}
            >
              <ObjectCard />
            </Stack>
          </Box>
        </Box>
      </Container>

      {/* reviews */}
      <Box sx={{ my: 15 }}>
        <Box sx={{ position: "relative" }}>
          <Box sx={{ alignContent: "space-between" }}>
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
            <Box sx={{ display: "flex" }}>
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
          <Container
            sx={{
              mt: 20,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1,
            }}
          >
            <Box>
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
                  User
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    textAlign: "center",
                    fontWeight: "600",
                    background: uiConfig.style.mainGradient.color,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Testimonials
                </Typography>
              </Box>
              <Typography
                variant="h4"
                sx={{ textAlign: "center", fontWeight: "500", mt: 0 }}
              >
                Student Feedbacks
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                mt: 5,
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
            </Box>
          </Container>
        </Box>
      </Box>

      {/* Experience */}
      <Box sx={{ position: "relative" }}>
        <Box sx={{ height: "50vh" }} />
        <img
          src={
            themeMode === themeModes.dark
              ? gradientImageDark
              : gradientImageLight
          }
          alt="gradientImage"
          width="100%"
        />
        <Container
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
          }}
        >
          <Box>
            <Typography
              variant="h3"
              sx={{ textAlign: "center", fontWeight: "600" }}
            >
              Ready to Transform
            </Typography>
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
                Your
              </Typography>

              <Typography
                variant="h3"
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
                display: "flex",
                alignItems: "stretch",
                justifyContent: "center",
                gap: 3,
              }}
            >
              <Box
                sx={{
                  width: "50%",
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
                      <Typography variant="h5" sx={{ fontWeight: "600" }}>
                        Join to EduWingz Today;
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: "600" }}>
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
                    Get Start Now
                  </Button>
                </Box>
              </Box>
              <Box
                sx={{
                  width: "50%",
                  backgroundColor: "graycolor.one",
                  borderRadius: 5,
                  p: 3,
                  borderBottom: 1,
                  borderLeft: 1,
                  borderColor: "primary.main",
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: "600" }}>
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
                    background: uiConfigs.style.mainGradient.color,
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
      </Box>
    </Box>
  );
};

export default HomePage;
