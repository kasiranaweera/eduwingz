// Enhanced Volunteer Section for EduWingz
import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  School,
  PersonAdd,
  CheckCircle,
  ArrowForward,
  ExpandMore,
  Info,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import ResearchImage from "../assets/img/research_img.jpg";
import uiConfig from "../configs/ui.config";

function ResearchPage() {
  const handleVolunteerClick = () => {
    // Open Google Form in a new tab
    window.open("https://forms.google.com/volunteer-form", "_blank");
  };

  return (
    <Box sx={{ py: 10 }}>
      <Container>
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
            Become a
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
            Volunteer
          </Typography>
        </Box>

        <Typography variant="h6" align="center" sx={{ mb: 5 }}>
          Help us transform education by contributing to our research on
          learning styles and AI-powered teaching
        </Typography>

        {/* Hero Banner */}
        <Paper
          elevation={3}
          sx={{
            mb: 5,
            p: 0,
            overflow: "hidden",
            borderRadius: 5,
            borderBottom: 1,
            borderLeft: 1,
            borderColor: "primary.main",
            backgroundColor: "background.default",
          }}
        >
          <Grid container sx={{ alignItems: "center" }}>
            <Grid
              item
              xs={12}
              md={7}
              sx={{ p: 3, alignContent: "space-between", display: "flow" }}
            >
              <Box>
                <Typography variant="h4" sx={{ fontWeight: "500" }}>
                  Join Our Research Initiative
                </Typography>
                <Typography variant="body1" paragraph>
                  Thank you for participating in this research study on learning
                  styles.
                </Typography>
              </Box>
              <Button
                sx={{
                  backgroundColor: "graycolor.one",
                  py: 1,
                  px: 3,
                  borderRadius: 100,
                  color: "primary.contrastText",
                  "&:hover": { color: "primary.main" },
                  mt: 3,
                }}
                component={Link}
                to="/main"
                endIcon={<ArrowForward />}
                onClick={handleVolunteerClick}
                size="large"
              >
                Start Survey Now
              </Button>
            </Grid>
            <Grid
              item
              xs={12}
              md={5}
              sx={{ display: { xs: "none", md: "block" }, p: 3 }}
            >
              <Box
                sx={{
                  width: "100%",
                  borderRadius: 5,
                  backgroundImage: `url(${ResearchImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  height: "150px",
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        <Divider sx={{ my: 10 }} />

        {/* About the Survey */}
        <Typography
          variant="h4"
          align="center"
          sx={{ mb: 5, mt: 5, fontWeight: "500" }}
        >
          About the Survey
        </Typography>
        <Grid container spacing={3} sx={{ mb: 3, justifyContent: "center" }}>
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
                  <School color="primary" sx={{ mr: 2, fontSize: 30 }} />
                  <Typography
                    variant="h5"
                    component="h2"
                    sx={{ fontWeight: "500" }}
                  >
                    About the Study
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <Typography sx={{ textAlign: "justify" }} variant="body1">
                  This survey is based on a{" "}
                  <b>modified version of the Index of Learning Styles (ILS)</b>,
                  informed by A Psychometric Study of the Index of Learning
                  Styles. The ILS is a widely used framework developed by
                  Richard M. Felder and Barbara A. Soloman at North Carolina
                  State University.
                </Typography>

                <Typography
                  sx={{ textAlign: "justify", mt: 1.5 }}
                  variant="body1"
                  paragraph
                >
                  Your responses will help us better understand how individuals
                  prefer to learn and will contribute to improving educational
                  approaches and methodologies.
                </Typography>

                <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                  <b>Purpose of the Study</b>
                </Typography>

                <Typography sx={{ textAlign: "justify" }} variant="body1">
                  This research aims to identify patterns in learning
                  preferences among students. By understanding these
                  preferences, we can develop more effective teaching strategies
                  and learning environments. The modified ILS scales used in
                  this survey have been refined to enhance reliability and
                  validity, ensuring more accurate insights into learning
                  styles.
                </Typography>
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
                  <Info color="primary" sx={{ mr: 2, fontSize: 30 }} />
                  <Typography
                    variant="h5"
                    component="h2"
                    sx={{ fontWeight: "500" }}
                  >
                    Participation Details
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <Box>
                  <Typography variant="h6">Estimated Time</Typography>

                  <Typography variant="body1" sx={{ mt: 1 }}>
                    The survey will take approximately <b>10–15 minutes</b> to
                    complete.
                  </Typography>
                </Box>
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6">Confidentiality</Typography>
                  <Typography
                    sx={{ mt: 1, textAlign: "justify" }}
                    variant="body1"
                  >
                    Your responses will remain completely confidential and will
                    be used solely for research purposes. No personally
                    identifiable information will be collected.
                  </Typography>
                </Box>
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6">Instructions</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        sx={{ textAlign: "justify" }}
                        primary="For each statement below, indicate your level of agreement using the provided scale."
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        sx={{ textAlign: "justify" }}
                        primary="There are no right or wrong answers; your honest responses are valuable."
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        sx={{ textAlign: "justify" }}
                        primary="Choose the option that best reflects your usual approach to learning."
                      />
                    </ListItem>
                  </List>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Survey Scale */}
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 5,
              backgroundColor: "background.default",
              width: "100%",
            }}
          >
            <Typography
              variant="h5"
              align="center"
              sx={{ fontWeight: "500", mb: 3 }}
            >
              Survey Scale
            </Typography>

            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={12} sm={6} md={2}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    textAlign: "center",
                    bgcolor: "graycolor.one",
                    borderRadius: 3,
                  }}
                >
                  <Typography variant="h6">1</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2">Strongly Disagree</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    textAlign: "center",
                    bgcolor: "graycolor.one",
                    borderRadius: 3,
                  }}
                >
                  <Typography variant="h6">2</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2">Disagree</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    textAlign: "center",
                    bgcolor: "graycolor.one",
                    borderRadius: 3,
                  }}
                >
                  <Typography variant="h6">3</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2">Neutral</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    textAlign: "center",
                    bgcolor: "graycolor.one",
                    borderRadius: 3,
                  }}
                >
                  <Typography variant="h6">4</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2">Agree</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    textAlign: "center",
                    bgcolor: "graycolor.one",
                    borderRadius: 3,
                  }}
                >
                  <Typography variant="h6">5</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2">Strongly Agree</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        {/* FAQ */}
        <Typography
          variant="h4"
          align="center"
          sx={{ mb: 5, mt: 5, fontWeight: "500" }}
        >
          Frequently Asked Questions
        </Typography>

        <Grid container spacing={3} sx={{ mb: 5, justifyContent: "center" }}>
          <Grid item xs={12} md={6}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>How will my data be used?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Your data will be used solely for research purposes to develop
                  our AI-powered teaching assistant. The data will help us
                  understand various learning styles and improve educational
                  methodologies. All data is anonymized and stored securely.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>
                  Will I receive my learning style results?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Yes! After completing the survey, you'll receive a
                  personalized report showing your learning style preferences
                  according to the ILS framework. This information can help you
                  understand your own learning tendencies better.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Grid>

          <Grid item xs={12} md={6}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>
                  Do I need any special qualifications to participate?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  No special qualifications are needed. We welcome participants
                  from all backgrounds, educational levels, and age groups. Your
                  unique perspective is valuable to our research.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>Can I withdraw from the study?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Yes, participation is completely voluntary. You can withdraw
                  at any time during the survey without any negative
                  consequences. If you've already submitted your responses and
                  wish to withdraw, please contact our research team with your
                  participant ID.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>

        <Divider sx={{ my: 10 }} />

        {/* Call to Action */}
        <Box
          sx={{
            textAlign: "center",
            mb: 5,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 3,
              overflow: "hidden",
              width: "100%",
              borderRadius: 5,
              borderBottom: 1,
              borderLeft: 1,
              borderColor: "primary.main",
              backgroundColor: "background.default",
            }}
          >
            <Typography
              variant="h4"
              sx={{ mb: 1, fontWeight: "500", color: "primary.contrastText" }}
            >
              Ready to Contribute?
            </Typography>
            <Typography
              sx={{ mb: 5, color: "primary.contrastText", fontWeight: "500" }}
            >
              Your participation will help shape the future of personalized
              education. Join our research initiative today!
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              endIcon={<PersonAdd />}
              onClick={handleVolunteerClick}
              sx={{
                px: 5,
                py: 1,
                borderRadius: 100,
                background: uiConfig.style.mainGradient.color,
              }}
            >
              Participate Now
            </Button>
          </Paper>
        </Box>

        {/* Contact Info */}
        <Box sx={{ textAlign: "center" }}>
          <Typography>
            Questions about the research? Contact us at{" "}
            <strong>research@eduwingz.com</strong>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default ResearchPage;
