import React, { useState } from 'react';
import { LoadingButton } from "@mui/lab";
import {
  Alert, Box, Stack, TextField, Typography, Button, Stepper, Step, StepLabel,
  Avatar, MenuItem, Paper, Grid
} from "@mui/material";
import { useFormik } from "formik";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import * as Yup from "yup";
import uiConfigs from "../configs/ui.config";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PsychologyIcon from '@mui/icons-material/Psychology';
import TuneIcon from '@mui/icons-material/Tune';
import { useNavigate } from 'react-router-dom';

const steps = [
  'Profile Data',
  'Learning Profile',
  'Learning Style'
];

const ProfileSetup = ({ onSkip, onSuccess, switchAuthState }) => {
  const { themeMode } = useSelector((state) => state.themeMode);
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState();
  const [profilePicPreview, setProfilePicPreview] = useState(null);

  // Custom states for Step 3 selection
  const [learningStyleMode, setLearningStyleMode] = useState(null); // 'questionnaire' | 'manual'

  const profileForm = useFormik({
    initialValues: {
      // Step 1 - Profile Data
      firstName: "",
      lastName: "",
      bio: "",
      profilePic: null,
      tagline: "",
      status: "active",

      // Step 2 - Learning Profile
      favSubject: "",
      averageLearningHours: "",
      studyTimePeriod: "morning",

      // Step 3 - Learning Style (only used if manual)
      active_reflective: 0,
      sensing_intuitive: 0,
      visual_verbal: 0,
      sequential_global: 0,
    },
    validationSchema: Yup.object({
      // Validating current step only
      ...(activeStep === 0 && {
        firstName: Yup.string().required("First name is required"),
        lastName: Yup.string().required("Last name is required"),
        bio: Yup.string().max(500, "Bio cannot exceed 500 characters"),
        tagline: Yup.string().max(100, "Tagline cannot exceed 100 characters"),
        status: Yup.string().required("Status is required"),
      }),
      ...(activeStep === 1 && {
        favSubject: Yup.string().required("Favorite subject is required"),
        averageLearningHours: Yup.number()
          .min(1, "Must be at least 1 hour")
          .max(24, "Cannot exceed 24 hours")
          .required("Average learning hours is required"),
        studyTimePeriod: Yup.string().required("Study time period is required"),
      }),
    }),
    onSubmit: async (values) => {
      // Submitting the final profile data
      setErrorMessage(undefined);
      setIsSubmitting(true);

      try {
        // Here you would normally await userApi.updateProfile(values)
        // Simulated API call wait
        await new Promise(r => setTimeout(r, 800));

        if (learningStyleMode === 'questionnaire') {
          toast.success("Profile saved! Let's discover your learning style...");
          navigate('/ils-questionnaire');
        } else {
          toast.success("Welcome! Your profile has been set up successfully!");
          if (onSuccess) onSuccess();
        }
      } catch (error) {
        setErrorMessage(error.message || "Failed to setup profile");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleNext = async () => {
    const errors = await profileForm.validateForm();
    profileForm.setTouched(
      Object.keys(profileForm.values).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {})
    );

    // Check if there are errors for the current step fields
    const stepFields =
      activeStep === 0 ? ['firstName', 'lastName', 'status'] :
        activeStep === 1 ? ['favSubject', 'averageLearningHours', 'studyTimePeriod'] : [];

    const hasStepErrors = stepFields.some(field => errors[field]);

    if (!hasStepErrors) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result);
        profileForm.setFieldValue("profilePic", file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectLearningStyleMode = (mode) => {
    setLearningStyleMode(mode);
    if (mode === 'questionnaire') {
      // Submit form immediately to save profile, then redirect
      profileForm.handleSubmit();
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
              Tell us about yourself
            </Typography>

            <Box sx={{ mb: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Avatar
                sx={{
                  width: 110,
                  height: 110,
                  mb: 2,
                  bgcolor: uiConfigs.style.mainGradient.color,
                  fontSize: "2.5rem",
                  boxShadow: '0 8px 24px rgba(255, 143, 0, 0.25)',
                  border: '4px solid',
                  borderColor: 'background.paper'
                }}
                src={profilePicPreview}
              >
                {profileForm.values.firstName?.charAt(0)?.toUpperCase() || "U"}
              </Avatar>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                sx={{ borderRadius: 8, textTransform: 'none' }}
              >
                Upload Photo
                <input hidden accept="image/*" type="file" onChange={handleProfilePicChange} />
              </Button>
            </Box>

            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "repeat(2, 1fr)", mb: 3 }}>
              <TextField
                type="text"
                placeholder="John"
                name="firstName"
                label="First Name"
                fullWidth
                required
                value={profileForm.values.firstName}
                onChange={profileForm.handleChange}
                onBlur={profileForm.handleBlur}
                error={profileForm.touched.firstName && Boolean(profileForm.errors.firstName)}
                helperText={profileForm.touched.firstName && profileForm.errors.firstName}
              />
              <TextField
                type="text"
                placeholder="Smith"
                name="lastName"
                label="Last Name"
                fullWidth
                required
                value={profileForm.values.lastName}
                onChange={profileForm.handleChange}
                onBlur={profileForm.handleBlur}
                error={profileForm.touched.lastName && Boolean(profileForm.errors.lastName)}
                helperText={profileForm.touched.lastName && profileForm.errors.lastName}
              />
            </Box>

            <TextField
              type="text"
              placeholder="e.g., Passionate learner"
              name="tagline"
              label="Tagline"
              fullWidth
              value={profileForm.values.tagline}
              onChange={profileForm.handleChange}
              onBlur={profileForm.handleBlur}
              sx={{ mb: 3 }}
            />

            <TextField
              type="text"
              placeholder="Tell us about yourself..."
              name="bio"
              label="Bio"
              fullWidth
              multiline
              rows={3}
              value={profileForm.values.bio}
              onChange={profileForm.handleChange}
              onBlur={profileForm.handleBlur}
              sx={{ mb: 3 }}
            />

            <TextField
              select
              name="status"
              label="Status"
              fullWidth
              value={profileForm.values.status}
              onChange={profileForm.handleChange}
              onBlur={profileForm.handleBlur}
            >
              <MenuItem value="active">Active Learner</MenuItem>
              <MenuItem value="casual">Casual Learner</MenuItem>
              <MenuItem value="professional">Professional Development</MenuItem>
            </TextField>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
              Your Learning Routine
            </Typography>

            <TextField
              type="text"
              placeholder="e.g., Mathematics, Coding"
              name="favSubject"
              label="Favorite Subject"
              fullWidth
              required
              value={profileForm.values.favSubject}
              onChange={profileForm.handleChange}
              onBlur={profileForm.handleBlur}
              error={profileForm.touched.favSubject && Boolean(profileForm.errors.favSubject)}
              helperText={profileForm.touched.favSubject && profileForm.errors.favSubject}
              sx={{ mb: 3 }}
            />

            <TextField
              type="number"
              name="averageLearningHours"
              label="Average Learning Hours per Day"
              fullWidth
              required
              inputProps={{ min: 1, max: 24 }}
              value={profileForm.values.averageLearningHours}
              onChange={profileForm.handleChange}
              onBlur={profileForm.handleBlur}
              error={profileForm.touched.averageLearningHours && Boolean(profileForm.errors.averageLearningHours)}
              helperText={profileForm.touched.averageLearningHours && profileForm.errors.averageLearningHours}
              sx={{ mb: 3 }}
            />

            <TextField
              select
              name="studyTimePeriod"
              label="Preferred Study Time"
              fullWidth
              required
              value={profileForm.values.studyTimePeriod}
              onChange={profileForm.handleChange}
              onBlur={profileForm.handleBlur}
              error={profileForm.touched.studyTimePeriod && Boolean(profileForm.errors.studyTimePeriod)}
              helperText={profileForm.touched.studyTimePeriod && profileForm.errors.studyTimePeriod}
            >
              <MenuItem value="morning">Morning (6AM - 12PM)</MenuItem>
              <MenuItem value="afternoon">Afternoon (12PM - 6PM)</MenuItem>
              <MenuItem value="evening">Evening (6PM - 12AM)</MenuItem>
              <MenuItem value="night">Night (12AM - 6AM)</MenuItem>
            </TextField>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 700, textAlign: 'center' }}>
              Discover Your Learning Style
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 4, textAlign: 'center' }}>
              Personalize EduWingz to adapt to how you learn best.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper
                  onClick={() => handleSelectLearningStyleMode('questionnaire')}
                  sx={{
                    p: 4,
                    height: '100%',
                    borderRadius: 4,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, rgba(255, 143, 0, 0.1) 0%, rgba(255, 143, 0, 0.02) 100%)',
                    border: '2px solid',
                    borderColor: learningStyleMode === 'questionnaire' ? 'primary.main' : 'transparent',
                    transition: 'all 0.3s ease',
                    boxShadow: learningStyleMode === 'questionnaire' ? '0 8px 32px rgba(255,143,0,0.2)' : 'none',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: 'primary.main',
                      boxShadow: '0 8px 32px rgba(255,143,0,0.15)'
                    }
                  }}
                >
                  <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'primary.main', color: 'white', mb: 2 }}>
                    <PsychologyIcon fontSize="large" />
                  </Box>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    Take the Questionnaire
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Answer 44 quick questions to get an accurate analysis of your learning style dimensions.
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600, bgcolor: 'rgba(255,143,0,0.1)', px: 2, py: 0.5, borderRadius: 4 }}>
                    ⭐️ Highly Recommended
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper
                  onClick={() => setLearningStyleMode('manual')}
                  sx={{
                    p: 4,
                    height: '100%',
                    borderRadius: 4,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    border: '2px solid',
                    borderColor: learningStyleMode === 'manual' ? 'text.primary' : themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: 'text.primary'
                    }
                  }}
                >
                  <Box sx={{ p: 2, borderRadius: '50%', bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', mb: 2 }}>
                    <TuneIcon fontSize="large" />
                  </Box>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    I Know My Style
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Manually define your Index of Learning Styles (ILS) preferences if you already know them.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Manual Entry Form */}
            {learningStyleMode === 'manual' && (
              <Box sx={{ mt: 5, animation: 'fadeIn 0.5s' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3 }}>
                  Set your Index of Learning Styles (ILS)
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Active vs Reflective"
                      name="active_reflective"
                      value={profileForm.values.active_reflective}
                      onChange={profileForm.handleChange}
                    >
                      <MenuItem value={-11}>Strongly Active</MenuItem>
                      <MenuItem value={-5}>Moderately Active</MenuItem>
                      <MenuItem value={0}>Balanced</MenuItem>
                      <MenuItem value={5}>Moderately Reflective</MenuItem>
                      <MenuItem value={11}>Strongly Reflective</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Sensing vs Intuitive"
                      name="sensing_intuitive"
                      value={profileForm.values.sensing_intuitive}
                      onChange={profileForm.handleChange}
                    >
                      <MenuItem value={-11}>Strongly Sensing</MenuItem>
                      <MenuItem value={-5}>Moderately Sensing</MenuItem>
                      <MenuItem value={0}>Balanced</MenuItem>
                      <MenuItem value={5}>Moderately Intuitive</MenuItem>
                      <MenuItem value={11}>Strongly Intuitive</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Visual vs Verbal"
                      name="visual_verbal"
                      value={profileForm.values.visual_verbal}
                      onChange={profileForm.handleChange}
                    >
                      <MenuItem value={-11}>Strongly Visual</MenuItem>
                      <MenuItem value={-5}>Moderately Visual</MenuItem>
                      <MenuItem value={0}>Balanced</MenuItem>
                      <MenuItem value={5}>Moderately Verbal</MenuItem>
                      <MenuItem value={11}>Strongly Verbal</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Sequential vs Global"
                      name="sequential_global"
                      value={profileForm.values.sequential_global}
                      onChange={profileForm.handleChange}
                    >
                      <MenuItem value={-11}>Strongly Sequential</MenuItem>
                      <MenuItem value={-5}>Moderately Sequential</MenuItem>
                      <MenuItem value={0}>Balanced</MenuItem>
                      <MenuItem value={5}>Moderately Global</MenuItem>
                      <MenuItem value={11}>Strongly Global</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Box sx={{ textAlign: "center", marginBottom: 5 }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }} variant="h4">
          Complete Your Profile
        </Typography>
        <Typography color="textSecondary" variant="body1">
          Personalize your EduWingz experience in three simple steps.
        </Typography>
      </Box>

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 5, '& .MuiStepLabel-root .Mui-completed': { color: 'success.main' } }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step Content */}
      <Box sx={{ mb: 5, minHeight: "260px" }}>
        {renderStepContent()}
      </Box>

      {/* Error Message */}
      {errorMessage && (
        <Box sx={{ marginBottom: 3 }}>
          <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
            {errorMessage}
          </Alert>
        </Box>
      )}

      {/* Navigation Buttons */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            disabled={activeStep === 0 || isSubmitting}
            onClick={handleBack}
            variant="text"
            sx={{ fontWeight: 600 }}
          >
            Back
          </Button>
          {activeStep === 0 && (
            <Button
              onClick={() => onSkip && onSkip()}
              variant="text"
              color="inherit"
              sx={{ opacity: 0.6 }}
            >
              Skip Setup
            </Button>
          )}
        </Box>

        {activeStep === steps.length - 1 ? (
          learningStyleMode === 'manual' && (
            <LoadingButton
              onClick={() => profileForm.handleSubmit()}
              variant="contained"
              loading={isSubmitting}
              sx={{
                background: uiConfigs.style.mainGradient.color,
                color: "white",
                borderRadius: 8,
                px: 4,
                py: 1,
                fontSize: '1.05rem',
                textTransform: 'none',
                boxShadow: '0 4px 14px 0 rgba(255,143,0,0.39)',
              }}
            >
              Complete Setup
            </LoadingButton>
          )
        ) : (
          <Button
            onClick={handleNext}
            variant="contained"
            sx={{
              bgcolor: 'text.primary',
              color: 'background.paper',
              borderRadius: 8,
              px: 4,
              py: 1,
              '&:hover': {
                bgcolor: 'text.secondary'
              }
            }}
          >
            Next Step
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ProfileSetup;
