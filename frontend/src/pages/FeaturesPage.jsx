import React from "react";
import {
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import contentData from "../assets/contentData";
import uiConfigs from "../configs/ui.config";
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { Stack } from "@mui/system";
import ObjectCard from "../components/ObjectCard";

const FeaturesPage = () => {
  const studentBenefits = [
    "Tailored learning style and pace",
    "Better understanding and retention",
    "Real-time support and insights",
    "Deeper learning pattern awareness",
    "More engaging educational experience",
  ];

  const teacherBenefits = [
    "Clear insights into student patterns",
    "More time for real interactions",
    "Data-informed teaching methods",
    "Better outcomes in class",
    "Support for all learners",
  ];
  return (
    <Box sx={{ my: 6 }}>
      <Container>
        {/* Introduction Section */}
        <Box textAlign="center" mb={5}>
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
              The
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
              Future of Education
            </Typography>
            <Typography
              variant="h3"
              sx={{ textAlign: "center", fontWeight: "600" }}
            >
              is Personal
            </Typography>
          </Box>
          <Typography
            variant="h6"
            color="text.secondary"
            maxWidth="md"
            mx="auto"
          >
            EduWingz is revolutionizing education by creating an intelligent AI
            teaching assistant that adapts to your unique learning style. Learn
            smarter, not harder.
          </Typography>
        </Box>

        {/* How It Works */}
        <Grid container spacing={3} mb={10}>
          {contentData.objectives.map((item, idx) => (
            <Grid item xs={12} md={3} key={idx}>
              <Card
                sx={{
                  p: 3,
                  height: "100%",
                  textAlign: "center",
                  borderRadius: 5,
                  backgroundColor: "background.default",

                }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography color="text.secondary">{item.desc}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box>
                    <Stack
                      direction="row"
                      spacing={2.5}
                      sx={{ justifyContent: "center" }}
                    >
                      <ObjectCard />
                    </Stack>
                  </Box>

        {/* Key Features */}
        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
          textAlign="center"
          mb={4}
          sx={{mt:10}}
        >
          Key Features
        </Typography>
        <Grid container spacing={3} mb={10}>
          {contentData.features.map((feature, idx) => (
            <Grid item xs={12} md={3} key={idx}>
              <Card
                sx={{
                  p: 3,
                  height: "100%",
                  textAlign: "center",
                  borderRadius: 5,
                  backgroundColor: "background.default",

                }}
              >
                <CardContent>
                  <Box mb={2}>{feature.icon}</Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Benefits Section */}
        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
          textAlign="center"
          mb={5}
        >
          Benefits
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card
              elevation={2}
              sx={{
                height: "100%",
                borderRadius: 5,
                backgroundColor: "background.default",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <SchoolIcon color="primary" sx={{ fontSize: 30, mr: 2 }} />
                  <Typography
                    variant="h5"
                    component="h2"
                    sx={{ fontWeight: "500" }}
                  >
                    For Students
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <List>
                  {studentBenefits.map((benefit, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircleOutlineIcon
                          sx={{ color: "primary.main" }}
                        />
                      </ListItemIcon>
                      <ListItemText primary={benefit} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
          <Card
              elevation={2}
              sx={{
                height: "100%",
                borderRadius: 5,
                backgroundColor: "background.default",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <PersonIcon color="primary" sx={{ fontSize: 36, mr: 2 }} />
                  <Typography
                    variant="h5"
                    component="h2"
                    sx={{ fontWeight: "500" }}
                  >
                    For Teachers
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <List>
                  {teacherBenefits.map((benefit, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircleOutlineIcon
                          sx={{ color: "primary.main" }}
                        />
                      </ListItemIcon>
                      <ListItemText primary={benefit} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Call to Action */}
        <Box textAlign="center" mt={10} mb={10}>
          <Typography variant="h5" fontWeight="500" gutterBottom>
            Ready to Experience Personalized Education?
          </Typography>
          <Button sx={{background: uiConfigs.style.mainGradient.color, color:'secondary.contrastText', borderRadius:100}} variant="contained" size="large" color="primary" href="/main">
            Get Started with EduWingz
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default FeaturesPage;
