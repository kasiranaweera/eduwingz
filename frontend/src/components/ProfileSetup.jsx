import React, { useState } from 'react'
import { LoadingButton } from "@mui/lab";
import {
  Alert,
  Box,
  Stack,
  TextField,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Avatar,
  MenuItem,
} from "@mui/material";
import { useFormik } from "formik";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import * as Yup from "yup";
import uiConfigs from "../configs/ui.config";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const steps = [
  'Profile Data',
  'Learning Profile',
  'Confirmation'
];

const ProfileSetup = ({ onSkip, onSuccess, switchAuthState }) => {
  const { themeMode } = useSelector((state) => state.themeMode);

  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState();
  const [profilePicPreview, setProfilePicPreview] = useState(null);

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
      strength: "",
      learningStyles: "",
    },
    validationSchema: Yup.object({
      // Step 1
      firstName: Yup.string().required("First name is required"),
      lastName: Yup.string().required("Last name is required"),
      bio: Yup.string().max(500, "Bio cannot exceed 500 characters"),
      tagline: Yup.string().max(100, "Tagline cannot exceed 100 characters"),
      status: Yup.string().required("Status is required"),
      
      // Step 2
      favSubject: Yup.string().required("Favorite subject is required"),
      averageLearningHours: Yup.number()
        .min(1, "Must be at least 1 hour")
        .max(24, "Cannot exceed 24 hours")
        .required("Average learning hours is required"),
      studyTimePeriod: Yup.string().required("Study time period is required"),
      strength: Yup.string().required("Strength is required"),
      learningStyles: Yup.string().required("Learning styles is required"),
    }),
    onSubmit: async (values) => {
      setErrorMessage(undefined);
      setIsSubmitting(true);
      
      try {
        // TODO: Replace with actual API call to update user profile
        // const { response, err } = await userApi.updateProfile(values);
        
        // Simulated success
        toast.success("Welcome! Your profile has been set up successfully!");
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        setErrorMessage(error.message || "Failed to setup profile");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
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

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Tell us about yourself
            </Typography>
            
            {/* Profile Picture Upload */}
            <Box sx={{ mb: 3, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  mb: 1,
                  bgcolor: "primary.main",
                  fontSize: "2rem",
                }}
                src={profilePicPreview}
              >
                {profileForm.values.firstName?.charAt(0)?.toUpperCase() || "U"}
              </Avatar>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                sx={{ mb: 1 }}
              >
                Upload Profile Picture
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={handleProfilePicChange}
                />
              </Button>
              <Typography variant="caption" color="textSecondary">
                JPG, PNG up to 5MB
              </Typography>
            </Box>

            {/* First and Last Name */}
            <Box sx={{ display: "grid", gap: 1, gridTemplateColumns: "repeat(2, 1fr)", mb: 2 }}>
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
                error={
                  profileForm.touched.firstName &&
                  profileForm.errors.firstName !== undefined
                }
                helperText={
                  profileForm.touched.firstName && profileForm.errors.firstName
                }
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
                error={
                  profileForm.touched.lastName &&
                  profileForm.errors.lastName !== undefined
                }
                helperText={
                  profileForm.touched.lastName && profileForm.errors.lastName
                }
              />
            </Box>

            {/* Tagline */}
            <TextField
              type="text"
              placeholder="e.g., Passionate learner"
              name="tagline"
              label="Tagline"
              fullWidth
              value={profileForm.values.tagline}
              onChange={profileForm.handleChange}
              onBlur={profileForm.handleBlur}
              error={
                profileForm.touched.tagline &&
                profileForm.errors.tagline !== undefined
              }
              helperText={
                profileForm.touched.tagline && profileForm.errors.tagline
              }
              sx={{ mb: 2 }}
            />

            {/* Bio */}
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
              error={
                profileForm.touched.bio && profileForm.errors.bio !== undefined
              }
              helperText={profileForm.touched.bio && profileForm.errors.bio}
              sx={{ mb: 2 }}
            />

            {/* Status */}
            <TextField
              select
              name="status"
              label="Status"
              fullWidth
              value={profileForm.values.status}
              onChange={profileForm.handleChange}
              onBlur={profileForm.handleBlur}
              error={
                profileForm.touched.status &&
                profileForm.errors.status !== undefined
              }
              helperText={
                profileForm.touched.status && profileForm.errors.status
              }
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
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Your Learning Profile
            </Typography>

            {/* Favorite Subject */}
            <TextField
              type="text"
              placeholder="e.g., Mathematics, Science"
              name="favSubject"
              label="Favorite Subject"
              fullWidth
              required
              value={profileForm.values.favSubject}
              onChange={profileForm.handleChange}
              onBlur={profileForm.handleBlur}
              error={
                profileForm.touched.favSubject &&
                profileForm.errors.favSubject !== undefined
              }
              helperText={
                profileForm.touched.favSubject && profileForm.errors.favSubject
              }
              sx={{ mb: 2 }}
            />

            {/* Average Learning Hours */}
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
              error={
                profileForm.touched.averageLearningHours &&
                profileForm.errors.averageLearningHours !== undefined
              }
              helperText={
                profileForm.touched.averageLearningHours &&
                profileForm.errors.averageLearningHours
              }
              sx={{ mb: 2 }}
            />

            {/* Study Time Period */}
            <TextField
              select
              name="studyTimePeriod"
              label="Preferred Study Time"
              fullWidth
              required
              value={profileForm.values.studyTimePeriod}
              onChange={profileForm.handleChange}
              onBlur={profileForm.handleBlur}
              error={
                profileForm.touched.studyTimePeriod &&
                profileForm.errors.studyTimePeriod !== undefined
              }
              helperText={
                profileForm.touched.studyTimePeriod &&
                profileForm.errors.studyTimePeriod
              }
              sx={{ mb: 2 }}
            >
              <MenuItem value="morning">Morning (6AM - 12PM)</MenuItem>
              <MenuItem value="afternoon">Afternoon (12PM - 6PM)</MenuItem>
              <MenuItem value="evening">Evening (6PM - 12AM)</MenuItem>
              <MenuItem value="night">Night (12AM - 6AM)</MenuItem>
            </TextField>

            {/* Strength */}
            <TextField
              type="text"
              placeholder="e.g., Problem solving, Creativity"
              name="strength"
              label="Your Strength"
              fullWidth
              required
              multiline
              rows={2}
              value={profileForm.values.strength}
              onChange={profileForm.handleChange}
              onBlur={profileForm.handleBlur}
              error={
                profileForm.touched.strength &&
                profileForm.errors.strength !== undefined
              }
              helperText={
                profileForm.touched.strength && profileForm.errors.strength
              }
              sx={{ mb: 2 }}
            />

            {/* Learning Styles */}
            <TextField
              type="text"
              placeholder="e.g., Visual, Auditory, Kinesthetic, Reading/Writing"
              name="learningStyles"
              label="Learning Styles"
              fullWidth
              required
              multiline
              rows={2}
              value={profileForm.values.learningStyles}
              onChange={profileForm.handleChange}
              onBlur={profileForm.handleBlur}
              error={
                profileForm.touched.learningStyles &&
                profileForm.errors.learningStyles !== undefined
              }
              helperText={
                profileForm.touched.learningStyles &&
                profileForm.errors.learningStyles
              }
            />
            
            <Alert severity="info" sx={{ mt: 2 }}>
              💡 You can take our <strong>Learning Style Assessment</strong> on Google Form to get a detailed analysis. We'll use this to personalize your learning experience!
            </Alert>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ textAlign: "center" }}>
            <CheckCircleIcon sx={{ fontSize: 80, color: "success.main", mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
              Almost There! 🎉
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: "textSecondary" }}>
              Review your information and confirm to complete your profile setup.
            </Typography>

            {/* Summary */}
            <Box sx={{ 
              bgcolor: themeMode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
              p: 2,
              borderRadius: 2,
              mb: 3,
              textAlign: "left"
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Profile Summary
              </Typography>
              <Stack spacing={1}>
                <Typography variant="caption">
                  <strong>Name:</strong> {profileForm.values.firstName} {profileForm.values.lastName}
                </Typography>
                <Typography variant="caption">
                  <strong>Tagline:</strong> {profileForm.values.tagline || "Not provided"}
                </Typography>
                <Typography variant="caption">
                  <strong>Favorite Subject:</strong> {profileForm.values.favSubject}
                </Typography>
                <Typography variant="caption">
                  <strong>Learning Hours:</strong> {profileForm.values.averageLearningHours} hours/day
                </Typography>
                <Typography variant="caption">
                  <strong>Study Time:</strong> {profileForm.values.studyTimePeriod}
                </Typography>
              </Stack>
            </Box>

            <Alert severity="success" sx={{ mb: 2 }}>
              ✅ Your profile is ready! Click "Complete Setup" to finish and start your learning journey.
            </Alert>

            <Alert severity="info" sx={{ fontSize: "0.85rem" }}>
              📋 <strong>Note:</strong> You can always update your profile later from the settings page. Don't forget to take our Google Form for a personalized learning style assessment!
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Box sx={{ textAlign: "center", marginBottom: 4 }}>
        <Typography sx={{ fontWeight: 500 }} variant="h5">
          Complete Your Profile
        </Typography>
        <Typography sx={{ color: "inherit", mt: 1 }} variant="body2">
          3 Easy Steps
        </Typography>
      </Box>

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step Content */}
      <Box sx={{ mb: 4, minHeight: "300px" }}>
        {renderStepContent()}
      </Box>

      {/* Error Message */}
      {errorMessage && (
        <Box sx={{ marginBottom: 2 }}>
          <Alert severity="error" variant="outlined">
            {errorMessage}
          </Alert>
        </Box>
      )}

      {/* Navigation Buttons */}
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>
          <Button
            onClick={() => {
              if (onSkip) {
                onSkip();
              }
            }}
            variant="text"
            sx={{ color: "primary.main" }}
          >
            Skip Setup
          </Button>
        </Box>

        {activeStep === steps.length - 1 ? (
          <LoadingButton
            onClick={() => profileForm.handleSubmit()}
            variant="contained"
            loading={isSubmitting}
            sx={{
              background: uiConfigs.style.mainGradient.color,
              color: "secondary.contrastText",
              borderRadius: 1,
            }}
          >
            Complete Setup
          </LoadingButton>
        ) : (
          <Button
            onClick={handleNext}
            variant="contained"
            sx={{
              background: uiConfigs.style.mainGradient.color,
              color: "secondary.contrastText",
              borderRadius: 1,
            }}
          >
            Next
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ProfileSetup
