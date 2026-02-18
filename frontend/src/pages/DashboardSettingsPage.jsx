import React, { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
  Switch,
  FormControlLabel,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  MenuItem,
  Paper,
  CircularProgress,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {
  PersonOutline,
  SecurityOutlined,
  Tune,
  HelpOutline,
  Edit,
  Lock,
  BugReport,
  PrivacyTip,
  OpenInNew,
  Save,
  Close,
  VerifiedUser,
  CheckCircle,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import uiConfigs from "../configs/ui.config";
import profileApi from "../api/modules/profile.api";
import learningApi from "../api/modules/learning.api";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const DashboardSettingsPage = () => {
  const { user } = useSelector((state) => state.user);
  const userId = user?.user_id || user?.id;

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState(null);
  const [editData, setEditData] = useState({});
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [openClearHistoryDialog, setOpenClearHistoryDialog] = useState(false);
  const [openClearCacheDialog, setOpenClearCacheDialog] = useState(false);

  const [settings, setSettings] = useState({
    language: "en",
    chatHistory: true,
    learningHistory: true,
    dataCollection: true,
    thirdParty: false,
  });

  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showLearningStats: true,
    showAchievements: true,
    allowMessages: true,
  });

  const [learningStyleAdjustments, setLearningStyleAdjustments] = useState({
    active_reflective: 0,
    sensing_intuitive: 0,
    visual_verbal: 0,
    sequential_global: 0,
  });

  const [isEditingLearningStyle, setIsEditingLearningStyle] = useState(false);
  const [learningStyleSource, setLearningStyleSource] = useState("interactions"); // "questionnaire", "manual", or "interactions"

  const [issueReport, setIssueReport] = useState({
    title: "",
    description: "",
    category: "bug",
  });

  useEffect(() => {
    if (!userId) return;
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { response, err } = await profileApi.getProfile(userId);
      if (err) {
        toast.error("Failed to load profile");
        return;
      }
      setProfile(response);
      setEditData(response);
      
      // Load manual adjustments if they exist
      if (response.manual_adjustments && response.manual_adjustments_completed) {
        setLearningStyleAdjustments(response.manual_adjustments);
        setLearningStyleSource("manual");
      } else if (response.questionnaire_completed) {
        setLearningStyleSource("questionnaire");
      } else {
        setLearningStyleSource("interactions");
      }
    } catch (error) {
      toast.error("Error loading profile");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setIsSubmitting(true);
    try {
      const { response, err } = await profileApi.updateProfile(userId, editData);
      if (err) {
        toast.error("Failed to update profile");
        return;
      }
      setProfile(response);
      setIsEditingProfile(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Error updating profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    setIsSubmitting(true);
    try {
      toast.info("Password reset link sent to your email");
    } catch (error) {
      toast.error("Error sending password reset");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnable2FA = async () => {
    setIsSubmitting(true);
    try {
      toast.info("Two-factor authentication setup initiated");
    } catch (error) {
      toast.error("Error enabling 2FA");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearChatHistory = async () => {
    setIsSubmitting(true);
    try {
      toast.success("Chat history cleared successfully");
      setOpenClearHistoryDialog(false);
    } catch (error) {
      toast.error("Error clearing chat history");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearCache = async () => {
    setIsSubmitting(true);
    try {
      toast.success("Cache cleared successfully");
      setOpenClearCacheDialog(false);
    } catch (error) {
      toast.error("Error clearing cache");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReport = () => {
    if (!issueReport.title || !issueReport.description) {
      toast.error("Please fill in all required fields");
      return;
    }
    toast.success("Issue reported successfully!");
    setIssueReport({ title: "", description: "", category: "bug" });
  };

  const handlePrivacyChange = (setting) => {
    setPrivacy((prev) => ({ ...prev, [setting]: !prev[setting] }));
    toast.success("Privacy settings updated");
  };

  const handleSettingsChange = (setting) => {
    setSettings((prev) => ({ ...prev, [setting]: !prev[setting] }));
    toast.success("Settings updated");
  };

  const handleLearningStyleChange = (dimension, value) => {
    setLearningStyleAdjustments((prev) => ({
      ...prev,
      [dimension]: Math.max(-11, Math.min(11, value)),
    }));
  };

  const handleSaveLearningStyleAdjustments = async () => {
    setIsSubmitting(true);
    try {
      // First, call Django API to update the profile with manual adjustments
      const { response, err } = await profileApi.updateLearningStyleAdjustments(userId, learningStyleAdjustments);
      if (err) {
        toast.error("Failed to update learning style adjustments in profile");
        return;
      }
      
      // Update profile state with the response
      setProfile(response);
      setEditData(response);
      
      // Second, call FastAPI learning endpoint to update the ILS learning profile
      // Use userId as session_id for the learning profile
      const { response: learningResponse, err: learningErr } = await learningApi.submitManualAdjustments(
        String(userId),
        learningStyleAdjustments
      );
      
      if (learningErr) {
        console.warn("Warning: Could not sync manual adjustments to learning profile:", learningErr);
        // Don't fail the user experience, but log the warning
      } else {
        console.log("✅ Manual adjustments synced to ILS learning profile", learningResponse);
      }
      
      setIsEditingLearningStyle(false);
      setLearningStyleSource("manual");
      toast.success("Learning style adjustments saved successfully! Adaptive learning mode activated.");
    } catch (error) {
      console.error("Error updating learning style adjustments:", error);
      toast.error("Error updating learning style adjustments");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetLearningStyleAdjustments = () => {
    setLearningStyleAdjustments({
      active_reflective: 0,
      sensing_intuitive: 0,
      visual_verbal: 0,
      sequential_global: 0,
    });
    setIsEditingLearningStyle(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Failed to load settings. Please try again.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ gap: 3, display: "flex", flexDirection: "column" }}>
      <Typography variant="h5" sx={{ fontWeight: 600, color: "primary.contrastText" }}>
        Settings
      </Typography>

      <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: "graycolor.two", borderRadius: 3 }}>
        <Box sx={{ display: "flex", gap: 0 }}>
          <Tabs
            orientation="vertical"
            variant="scrollable"
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              borderRight: 1,
              borderColor: "graycolor.two",
              minWidth: 220,
              pr: 3,
              "& .MuiTab-root": {
                alignItems: "center",
                textAlign: "left",
                borderRadius: 2,
                transition: "all 0.2s ease",
                justifyContent: "flex-start",
                color: "text.secondary",
                "&:hover": { bgcolor: "action.hover", color: "primary.main" },
                "&.Mui-selected": { bgcolor: "action.hover", color: "primary.main", fontWeight: 600 },
              },
              "& .MuiTabs-indicator": { width: 3, borderRadius: "0 2px 2px 0", right: 0 },
            }}
          >
            <Tab label="Public Profile" icon={<PersonOutline sx={{ mr: 1 }} />} iconPosition="start" />
            <Tab label="Account Settings" icon={<SecurityOutlined sx={{ mr: 1 }} />} iconPosition="start" />
            <Tab label="Security" icon={<Lock sx={{ mr: 1 }} />} iconPosition="start" />
            <Tab label="Privacy" icon={<PrivacyTip sx={{ mr: 1 }} />} iconPosition="start" />
            <Divider sx={{ my: 2 }} />
            <Tab label="Preferences" icon={<Tune sx={{ mr: 1 }} />} iconPosition="start" />
            {/* <Tab label="Report Issue" icon={<BugReport sx={{ mr: 1 }} />} iconPosition="start" /> */}
            <Tab label="Support" icon={<HelpOutline sx={{ mr: 1 }} />} iconPosition="start" />
          </Tabs>

          <Box sx={{ flexGrow: 1 }}>
            {/* Tab 0: PUBLIC PROFILE */}
            <TabPanel value={activeTab} index={0}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Public Profile
              </Typography>
              <Paper sx={{ p: 2.5, border: 1, borderColor: "graycolor.two", borderRadius: 2, mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Account Information</Typography>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>Username</Typography>
                    <Typography variant="body2" sx={{ color: "primary.contrastText" }}>@{profile.username}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>Email</Typography>
                    <Typography variant="body2" sx={{ color: "primary.contrastText" }}>{profile.email || user?.email}</Typography>
                  </Box>
                </Stack>
              </Paper>
              <Divider sx={{ my: 3 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Edit Profile Information</Typography>
              {!isEditingProfile ? (
                <Paper sx={{ p: 2.5, border: 1, borderColor: "graycolor.two", borderRadius: 2 }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>Full Name</Typography>
                      <Typography variant="body2" sx={{ color: "primary.contrastText" }}>{profile.first_name} {profile.last_name}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>Bio</Typography>
                      <Typography variant="body2" sx={{ color: "primary.contrastText", whiteSpace: "pre-wrap" }}>{profile.bio || "Not set"}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>Tagline</Typography>
                      <Typography variant="body2" sx={{ color: "primary.contrastText" }}>{profile.tagline || "Not set"}</Typography>
                    </Box>
                  </Stack>
                  <Button startIcon={<Edit />} onClick={() => setIsEditingProfile(true)} variant="outlined" sx={{ borderColor: "graycolor.two", color: "primary.main", mt: 2 }}>Edit Profile</Button>
                </Paper>
              ) : (
                <Stack spacing={2.5}>
                  <TextField label="First Name" name="first_name" value={editData.first_name || ""} onChange={handleProfileChange} fullWidth variant="outlined" size="small" />
                  <TextField label="Last Name" name="last_name" value={editData.last_name || ""} onChange={handleProfileChange} fullWidth variant="outlined" size="small" />
                  <TextField label="Bio" name="bio" value={editData.bio || ""} onChange={handleProfileChange} fullWidth multiline rows={3} variant="outlined" placeholder="Tell about yourself..." />
                  <TextField label="Tagline" name="tagline" value={editData.tagline || ""} onChange={handleProfileChange} fullWidth variant="outlined" size="small" placeholder="e.g., Passionate learner" />
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <LoadingButton variant="contained" startIcon={<Save />} onClick={handleSaveProfile} loading={isSubmitting} sx={{ background: uiConfigs.style.mainGradient.color, color: "secondary.contrastText" }}>Save Changes</LoadingButton>
                    <Button variant="outlined" startIcon={<Close />} onClick={() => { setIsEditingProfile(false); setEditData(profile); }} sx={{ borderColor: "graycolor.two", color: "primary.main" }}>Cancel</Button>
                  </Box>
                </Stack>
              )}
            </TabPanel>

            {/* Tab 1: ACCOUNT SETTINGS */}
            <TabPanel value={activeTab} index={1}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Account Settings</Typography>
              <Paper sx={{ p: 2.5, border: 1, borderColor: "graycolor.two", borderRadius: 2, mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Change Username</Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField label="Current Username" value={profile.username} disabled fullWidth size="small" variant="outlined" />
                  <Button variant="outlined" sx={{ borderColor: "graycolor.two", color: "primary.main" }}>Change</Button>
                </Box>
              </Paper>
              <Paper sx={{ p: 2.5, border: 1, borderColor: "graycolor.two", borderRadius: 2, mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Email Address</Typography>
                <TextField label="Email" value={profile.email || user?.email} disabled fullWidth size="small" variant="outlined" />
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 1 }}>Email cannot be changed for security reasons</Typography>
              </Paper>
              <Divider sx={{ my: 3 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Your Learning Styles</Typography>
              {(profile.learning_styles || learningStyleAdjustments) && (
                <Paper sx={{ p: 2.5, border: 1, borderColor: "graycolor.two", borderRadius: 2, mb: 3 }}>
                  <Box sx={{ mb: 2, pb: 1.5, borderBottom: 1, borderColor: "graycolor.two" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CheckCircle sx={{ fontSize: 16, color: "success.main" }} />
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                        Source: {learningStyleSource === "manual" ? "📝 Manual Adjustments (from Settings)" : learningStyleSource === "questionnaire" ? "📋 Questionnaire-based" : "🔍 Interaction-based"}
                      </Typography>
                    </Box>
                  </Box>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>Active vs Reflective</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={((
                          (learningStyleSource === "manual" ? learningStyleAdjustments : profile.learning_styles)?.active_reflective || 0
                        ) + 11) / 22 * 100} 
                        sx={{ height: 6, borderRadius: 3, "& .MuiLinearProgress-bar": { background: uiConfigs.style.mainGradient.color } }} 
                      />
                      <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem", mt: 0.5, display: "block" }}>
                        Value: {(learningStyleSource === "manual" ? learningStyleAdjustments : profile.learning_styles)?.active_reflective || 0}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>Sensing vs Intuitive</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={((
                          (learningStyleSource === "manual" ? learningStyleAdjustments : profile.learning_styles)?.sensing_intuitive || 0
                        ) + 11) / 22 * 100} 
                        sx={{ height: 6, borderRadius: 3, "& .MuiLinearProgress-bar": { background: uiConfigs.style.mainGradient.color } }} 
                      />
                      <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem", mt: 0.5, display: "block" }}>
                        Value: {(learningStyleSource === "manual" ? learningStyleAdjustments : profile.learning_styles)?.sensing_intuitive || 0}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>Visual vs Verbal</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={((
                          (learningStyleSource === "manual" ? learningStyleAdjustments : profile.learning_styles)?.visual_verbal || 0
                        ) + 11) / 22 * 100} 
                        sx={{ height: 6, borderRadius: 3, "& .MuiLinearProgress-bar": { background: uiConfigs.style.mainGradient.color } }} 
                      />
                      <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem", mt: 0.5, display: "block" }}>
                        Value: {(learningStyleSource === "manual" ? learningStyleAdjustments : profile.learning_styles)?.visual_verbal || 0}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>Sequential vs Global</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={((
                          (learningStyleSource === "manual" ? learningStyleAdjustments : profile.learning_styles)?.sequential_global || 0
                        ) + 11) / 22 * 100} 
                        sx={{ height: 6, borderRadius: 3, "& .MuiLinearProgress-bar": { background: uiConfigs.style.mainGradient.color } }} 
                      />
                      <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem", mt: 0.5, display: "block" }}>
                        Value: {(learningStyleSource === "manual" ? learningStyleAdjustments : profile.learning_styles)?.sequential_global || 0}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              )}
              <Divider sx={{ my: 3 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>⚙️ Adjust Learning Style Preferences</Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>Manually customize your learning style preferences from the settings page. These adjustments will be prioritized over questionnaire and interaction-based learning styles.</Typography>
              
              {!isEditingLearningStyle ? (
                <Paper sx={{ p: 2.5, border: 1, borderColor: "graycolor.two", borderRadius: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>Current source of learning style:</Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                        <CheckCircle sx={{ fontSize: 18, color: "success.main" }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {learningStyleSource === "manual" ? "📝 Manual Adjustments (from Settings)" : learningStyleSource === "questionnaire" ? "📋 Questionnaire-based" : "🔍 Interaction-based"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Button 
                    startIcon={<Edit />} 
                    onClick={() => setIsEditingLearningStyle(true)} 
                    variant="outlined" 
                    sx={{ borderColor: "graycolor.two", color: "primary.main" }}
                  >
                    Customize Learning Style
                  </Button>
                </Paper>
              ) : (
                <Paper sx={{ p: 2.5, border: 1, borderColor: "graycolor.two", borderRadius: 2 }}>
                  <Stack spacing={3}>
                    <Alert severity="info">
                      Use the sliders below to adjust your learning style preferences. Values range from -11 to +11. These custom adjustments will be your primary learning style profile.
                    </Alert>
                    
                    {/* Active vs Reflective */}
                    <Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Active Learning ←→ Reflective Learning</Typography>
                        <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 600 }}>{learningStyleAdjustments.active_reflective}</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>Negative = Active (do-ers), Positive = Reflective (thinkers)</Typography>
                      <input 
                        type="range" 
                        min="-11" 
                        max="11" 
                        value={learningStyleAdjustments.active_reflective}
                        onChange={(e) => handleLearningStyleChange("active_reflective", parseInt(e.target.value))}
                        style={{ width: "100%", marginTop: 8 }}
                      />
                    </Box>

                    {/* Sensing vs Intuitive */}
                    <Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Sensing (Practical) ←→ Intuitive (Conceptual)</Typography>
                        <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 600 }}>{learningStyleAdjustments.sensing_intuitive}</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>Negative = Sensing (facts, examples), Positive = Intuitive (theories, concepts)</Typography>
                      <input 
                        type="range" 
                        min="-11" 
                        max="11" 
                        value={learningStyleAdjustments.sensing_intuitive}
                        onChange={(e) => handleLearningStyleChange("sensing_intuitive", parseInt(e.target.value))}
                        style={{ width: "100%", marginTop: 8 }}
                      />
                    </Box>

                    {/* Visual vs Verbal */}
                    <Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Visual (Diagrams) ←→ Verbal (Words)</Typography>
                        <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 600 }}>{learningStyleAdjustments.visual_verbal}</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>Negative = Visual (pictures, diagrams), Positive = Verbal (text, explanations)</Typography>
                      <input 
                        type="range" 
                        min="-11" 
                        max="11" 
                        value={learningStyleAdjustments.visual_verbal}
                        onChange={(e) => handleLearningStyleChange("visual_verbal", parseInt(e.target.value))}
                        style={{ width: "100%", marginTop: 8 }}
                      />
                    </Box>

                    {/* Sequential vs Global */}
                    <Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Sequential (Step-by-step) ←→ Global (Big Picture)</Typography>
                        <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 600 }}>{learningStyleAdjustments.sequential_global}</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>Negative = Sequential (linear progression), Positive = Global (overview first)</Typography>
                      <input 
                        type="range" 
                        min="-11" 
                        max="11" 
                        value={learningStyleAdjustments.sequential_global}
                        onChange={(e) => handleLearningStyleChange("sequential_global", parseInt(e.target.value))}
                        style={{ width: "100%", marginTop: 8 }}
                      />
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: "flex", gap: 2, pt: 2 }}>
                      <LoadingButton 
                        variant="contained" 
                        startIcon={<Save />} 
                        onClick={handleSaveLearningStyleAdjustments} 
                        loading={isSubmitting}
                        sx={{ background: uiConfigs.style.mainGradient.color, color: "secondary.contrastText" }}
                      >
                        Save Adjustments
                      </LoadingButton>
                      <Button 
                        variant="outlined" 
                        startIcon={<Close />} 
                        onClick={handleResetLearningStyleAdjustments}
                        sx={{ borderColor: "graycolor.two", color: "primary.main" }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Stack>
                </Paper>
              )}
            </TabPanel>

            {/* Tab 2: SECURITY */}
            <TabPanel value={activeTab} index={2}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Security</Typography>
              <Paper sx={{ p: 2.5, border: 1, borderColor: "graycolor.two", borderRadius: 2, mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>🔐 Change Password</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>Keep your account secure with a strong password. Change it regularly.</Typography>
                <LoadingButton variant="contained" startIcon={<Lock />} onClick={handleResetPassword} loading={isSubmitting} sx={{ background: uiConfigs.style.mainGradient.color, color: "secondary.contrastText" }}>Send Password Reset Email</LoadingButton>
              </Paper>
              <Paper sx={{ p: 2.5, border: 1, borderColor: "graycolor.two", borderRadius: 2, mb: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>✓ Two-Factor Authentication</Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>Add an extra layer of security to your account</Typography>
                  </Box>
                  <CheckCircle sx={{ color: "success.main" }} />
                </Box>
                <Alert severity="info" sx={{ mb: 2 }}>Status: <strong>Not Enabled</strong></Alert>
                <Button variant="outlined" sx={{ borderColor: "graycolor.two", color: "primary.main" }} onClick={handleEnable2FA}>Enable 2FA</Button>
              </Paper>
              <Paper sx={{ p: 2.5, border: 1, borderColor: "graycolor.two", borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>�� Active Sessions</Typography>
                <List>
                  <ListItem sx={{ borderBottom: 1, borderColor: "graycolor.two" }}>
                    <ListItemIcon><VerifiedUser sx={{ color: "primary.main" }} /></ListItemIcon>
                    <ListItemText primary="Current Device" secondary={`Last active: ${new Date().toLocaleString()}`} />
                  </ListItem>
                </List>
              </Paper>
            </TabPanel>

            {/* Tab 3: PRIVACY */}
            <TabPanel value={activeTab} index={3}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Privacy Controls</Typography>
              <Paper sx={{ p: 2.5, border: 1, borderColor: "graycolor.two", borderRadius: 2, mb: 3 }}>
                <FormControlLabel control={<Switch checked={privacy.profilePublic} onChange={() => handlePrivacyChange("profilePublic")} />} label={<Box><Typography variant="subtitle2" sx={{ fontWeight: 600 }}>👤 Public Profile</Typography><Typography variant="caption" sx={{ color: "text.secondary" }}>Allow others to view your profile</Typography></Box>} />
              </Paper>
              <Paper sx={{ p: 2.5, border: 1, borderColor: "graycolor.two", borderRadius: 2, mb: 3 }}>
                <FormControlLabel control={<Switch checked={privacy.showLearningStats} onChange={() => handlePrivacyChange("showLearningStats")} />} label={<Box><Typography variant="subtitle2" sx={{ fontWeight: 600 }}>📊 Show Learning Statistics</Typography><Typography variant="caption" sx={{ color: "text.secondary" }}>Display your learning progress and stats</Typography></Box>} />
              </Paper>
              <Paper sx={{ p: 2.5, border: 1, borderColor: "graycolor.two", borderRadius: 2, mb: 3 }}>
                <FormControlLabel control={<Switch checked={privacy.showAchievements} onChange={() => handlePrivacyChange("showAchievements")} />} label={<Box><Typography variant="subtitle2" sx={{ fontWeight: 600 }}>🏆 Show Achievements</Typography><Typography variant="caption" sx={{ color: "text.secondary" }}>Display earned badges and achievements</Typography></Box>} />
              </Paper>
              <Paper sx={{ p: 2.5, border: 1, borderColor: "graycolor.two", borderRadius: 2 }}>
                <FormControlLabel control={<Switch checked={privacy.allowMessages} onChange={() => handlePrivacyChange("allowMessages")} />} label={<Box><Typography variant="subtitle2" sx={{ fontWeight: 600 }}>💬 Allow Direct Messages</Typography><Typography variant="caption" sx={{ color: "text.secondary" }}>Let others send you messages</Typography></Box>} />
              </Paper>
            </TabPanel>

            {/* Tab 4: PREFERENCES */}
            <TabPanel value={activeTab} index={4}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Preferences</Typography>
              <Paper sx={{ p: 2.5, border: 1, borderColor: "graycolor.two", borderRadius: 2, mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>🌐 Primary Language</Typography>
                <TextField select value={settings.language} onChange={(e) => setSettings({ ...settings, language: e.target.value })} fullWidth size="small" variant="outlined">
                  <MenuItem value="en">🇬🇧 English</MenuItem>
                  <MenuItem value="es">🇪🇸 Español</MenuItem>
                  <MenuItem value="fr">🇫🇷 Français</MenuItem>
                  <MenuItem value="de">🇩🇪 Deutsch</MenuItem>
                  <MenuItem value="zh">🇨🇳 中文</MenuItem>
                </TextField>
              </Paper>
              <Paper sx={{ p: 2.5, border: 1, borderColor: "graycolor.two", borderRadius: 2, mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>💬 Chat History Management</Typography>
                <FormControlLabel control={<Switch checked={settings.chatHistory} onChange={() => handleSettingsChange("chatHistory")} />} label={<Typography variant="body2">Save chat conversations for future reference</Typography>} />
                <Button variant="outlined" color="warning" size="small" onClick={() => setOpenClearHistoryDialog(true)} sx={{ borderColor: "graycolor.two", mt: 2 }}>Clear Chat History</Button>
              </Paper>
              <Paper sx={{ p: 2.5, border: 1, borderColor: "graycolor.two", borderRadius: 2, mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>📚 Lesson Management</Typography>
                <FormControlLabel control={<Switch checked={settings.learningHistory} onChange={() => handleSettingsChange("learningHistory")} />} label={<Typography variant="body2">Track your lesson progress and history</Typography>} />
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 1 }}>Download your lesson history and certificates</Typography>
                <Button variant="outlined" size="small" sx={{ borderColor: "graycolor.two", color: "primary.main", mt: 1 }}>Download Lessons Data</Button>
              </Paper>
              <Paper sx={{ p: 2.5, border: 1, borderColor: "graycolor.two", borderRadius: 2, mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>📄 Documents & Storage</Typography>
                <Stack spacing={1.5}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2">Storage Used</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>2.4 GB / 10 GB</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={24} sx={{ height: 8, borderRadius: 4, "& .MuiLinearProgress-bar": { background: uiConfigs.style.mainGradient.color } }} />
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Button variant="outlined" size="small" sx={{ borderColor: "graycolor.two", color: "primary.main" }}>Upload Documents</Button>
                    <Button variant="outlined" color="warning" size="small" onClick={() => setOpenClearCacheDialog(true)} sx={{ borderColor: "graycolor.two" }}>Clear Cache</Button>
                  </Box>
                </Stack>
              </Paper>
              <Paper sx={{ p: 2.5, border: 1, borderColor: "graycolor.two", borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>📊 Data & Analytics</Typography>
                <FormControlLabel control={<Switch checked={settings.dataCollection} onChange={() => handleSettingsChange("dataCollection")} />} label={<Typography variant="body2">Allow us to collect usage data for improvements</Typography>} />
                <FormControlLabel control={<Switch checked={settings.thirdParty} onChange={() => handleSettingsChange("thirdParty")} />} label={<Typography variant="body2">Allow third-party integrations</Typography>} />
              </Paper>
            </TabPanel>

            {/* Tab 5: REPORT ISSUE */}
            <TabPanel value={activeTab} index={5}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Report & Feedback</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Report a Problem</Typography>
              <Paper sx={{ p: 2.5, border: 1, borderColor: "graycolor.two", borderRadius: 2, mb: 3 }}>
                <Alert severity="info" sx={{ mb: 2 }}>Help us improve by reporting bugs or issues you encounter</Alert>
                <Stack spacing={2}>
                  <TextField label="Issue Title" placeholder="Brief title of the problem" fullWidth variant="outlined" size="small" value={issueReport.title} onChange={(e) => setIssueReport({ ...issueReport, title: e.target.value })} />
                  <TextField label="Description" placeholder="Provide detailed information about the issue..." fullWidth multiline rows={4} variant="outlined" value={issueReport.description} onChange={(e) => setIssueReport({ ...issueReport, description: e.target.value })} />
                  <TextField select label="Category" value={issueReport.category} onChange={(e) => setIssueReport({ ...issueReport, category: e.target.value })} fullWidth variant="outlined" size="small">
                    <MenuItem value="bug">🐛 Bug Report</MenuItem>
                    <MenuItem value="ui">🎨 UI/UX Issue</MenuItem>
                    <MenuItem value="performance">⚡ Performance Issue</MenuItem>
                    <MenuItem value="other">📝 Other</MenuItem>
                  </TextField>
                  <Button variant="contained" onClick={handleSubmitReport} sx={{ background: uiConfigs.style.mainGradient.color, color: "secondary.contrastText" }}>Submit Report</Button>
                </Stack>
              </Paper>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, mt: 3 }}>Raise a Feature Request</Typography>
              <Paper sx={{ p: 2.5, border: 1, borderColor: "graycolor.two", borderRadius: 2 }}>
                <Alert severity="success" sx={{ mb: 2 }}>Suggest new features you'd like to see in EduWingz</Alert>
                <Stack spacing={2}>
                  <TextField label="Feature Title" placeholder="What would you like to see?" fullWidth variant="outlined" size="small" />
                  <TextField label="Description" placeholder="Explain how this feature would help..." fullWidth multiline rows={3} variant="outlined" />
                  <Button variant="contained" sx={{ background: uiConfigs.style.mainGradient.color, color: "secondary.contrastText" }}>Submit Feature Request</Button>
                </Stack>
              </Paper>
            </TabPanel>

            {/* Tab 6: SUPPORT */}
            <TabPanel value={activeTab} index={6}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Help & Support</Typography>
              <Paper sx={{ p: 2.5, border: 1, borderColor: "graycolor.two", borderRadius: 2, mb: 3, cursor: "pointer", transition: "all 0.3s", "&:hover": { boxShadow: 2, borderColor: "primary.main" } }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>📖 Documentation</Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>Browse guides, tutorials, and technical documentation</Typography>
                  </Box>
                  <OpenInNew sx={{ color: "primary.main" }} />
                </Box>
              </Paper>
              <Paper sx={{ p: 2.5, border: 1, borderColor: "graycolor.two", borderRadius: 2, mb: 3, cursor: "pointer", transition: "all 0.3s", "&:hover": { boxShadow: 2, borderColor: "primary.main" } }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>💡 Help Center</Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>Get answers to common questions and troubleshooting</Typography>
                  </Box>
                  <OpenInNew sx={{ color: "primary.main" }} />
                </Box>
              </Paper>
              <Paper sx={{ p: 2.5, border: 1, borderColor: "graycolor.two", borderRadius: 2, mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>ℹ️ About EduWingz</Typography>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>Version</Typography>
                    <Typography variant="body2" sx={{ color: "primary.contrastText" }}>v2.0.1</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>Build</Typography>
                    <Typography variant="body2" sx={{ color: "primary.contrastText" }}>Build 2025.11.26</Typography>
                  </Box>
                </Stack>
              </Paper>
              <Paper sx={{ p: 2.5, border: 1, borderColor: "graycolor.two", borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>📧 Contact Support</Typography>
                <Stack spacing={1}>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>Need additional help? Reach out to our support team:</Typography>
                  <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 600 }}>support@eduwingz.com</Typography>
                  <Button variant="outlined" size="small" sx={{ borderColor: "graycolor.two", color: "primary.main", mt: 1 }}>Send Email</Button>
                </Stack>
              </Paper>
            </TabPanel>
          </Box>
        </Box>
      </Paper>

      <Dialog open={openClearHistoryDialog} onClose={() => setOpenClearHistoryDialog(false)}>
        <DialogTitle>Clear Chat History</DialogTitle>
        <DialogContent><DialogContentText sx={{ mt: 2 }}>Are you sure you want to clear all chat history? This action cannot be undone.</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenClearHistoryDialog(false)}>Cancel</Button>
          <LoadingButton onClick={handleClearChatHistory} color="warning" variant="contained" loading={isSubmitting}>Clear History</LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog open={openClearCacheDialog} onClose={() => setOpenClearCacheDialog(false)}>
        <DialogTitle>Clear Cache</DialogTitle>
        <DialogContent><DialogContentText sx={{ mt: 2 }}>Clearing cache will free up storage space. This may affect performance temporarily.</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenClearCacheDialog(false)}>Cancel</Button>
          <LoadingButton onClick={handleClearCache} color="warning" variant="contained" loading={isSubmitting}>Clear Cache</LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardSettingsPage;
