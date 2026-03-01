import React, { useCallback, useState, useEffect } from "react";
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
  useMediaQuery,
  useTheme,
  alpha,
  Grid,
  Chip,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {
  PersonOutline,
  SecurityOutlined,
  Tune,
  HelpOutline,
  Edit,
  Lock,
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
import learningApi from "../api/modules/lessons.api";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      style={{ width: '100%' }}
      {...other}
    >
      {value === index && (
        <Box sx={{
          p: { xs: 2, md: 4 },
          animation: 'fadeIn 0.4s ease-out'
        }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const DashboardSettingsPage = () => {
  const { user } = useSelector((state) => state.user);
  const { themeMode } = useSelector((state) => state.themeMode);
  const userId = user?.user_id || user?.id;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isDark = themeMode === "dark";

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
  const [learningStyleSource, setLearningStyleSource] = useState("interactions");

  const [issueReport, setIssueReport] = useState({
    title: "",
    description: "",
    category: "bug",
  });

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { response, err } = await profileApi.getProfile(userId);
      if (err) {
        toast.error("Failed to load profile");
        return;
      }
      setProfile(response);
      setEditData(response);

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
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    fetchProfile();
  }, [userId, fetchProfile]);

  const handleTabChange = (event, newValue) => setActiveTab(newValue);
  const handleProfileChange = (e) => setEditData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

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
    setTimeout(() => { toast.info("Password reset link sent to your email"); setIsSubmitting(false); }, 1000);
  };

  const handleEnable2FA = async () => {
    setIsSubmitting(true);
    setTimeout(() => { toast.info("Two-factor authentication setup initiated"); setIsSubmitting(false); }, 1000);
  };

  const handleClearChatHistory = async () => {
    setIsSubmitting(true);
    setTimeout(() => { toast.success("Chat history cleared successfully"); setOpenClearHistoryDialog(false); setIsSubmitting(false); }, 1000);
  };

  const handleClearCache = async () => {
    setIsSubmitting(true);
    setTimeout(() => { toast.success("Cache cleared successfully"); setOpenClearCacheDialog(false); setIsSubmitting(false); }, 1000);
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
      const { response, err } = await profileApi.updateLearningStyleAdjustments(userId, learningStyleAdjustments);
      if (err) { toast.error("Failed to update learning style adjustments"); return; }
      setProfile(response);
      setEditData(response);

      await learningApi.submitManualAdjustments(String(userId), learningStyleAdjustments);

      setIsEditingLearningStyle(false);
      setLearningStyleSource("manual");
      toast.success("Learning style adjustments saved successfully!");
    } catch (error) {
      toast.error("Error updating learning style");
    } finally {
      setIsSubmitting(false);
    }
  };

  const premiumPaperStyle = {
    p: { xs: 2.5, md: 4 },
    borderRadius: 4,
    bgcolor: isDark ? alpha(theme.palette.background.paper, 0.4) : alpha('#ffffff', 0.8),
    backdropFilter: "blur(20px)",
    border: "1px solid",
    borderColor: isDark ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.common.black, 0.05),
    boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.05)',
    mb: 4
  };

  const sectionPaperStyle = {
    p: 3,
    borderRadius: 3,
    bgcolor: isDark ? alpha(theme.palette.background.default, 0.4) : alpha('#ffffff', 0.6),
    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
    mb: 3,
    transition: 'all 0.3s',
    '&:hover': {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.1)}`
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: '60vh' }}>
        <CircularProgress sx={{ color: uiConfigs.style.mainGradient.color }} />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>Failed to load settings. Please try again.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 6, position: 'relative' }}>
      {/* Dynamic Background */}
      <Box sx={{
        position: 'absolute',
        top: -50,
        right: -50,
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${alpha(theme.palette.info.main, 0.15)} 0%, transparent 70%)`,
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <Typography variant="h4" sx={{
        fontWeight: 800, mb: 4, position: 'relative', zIndex: 1,
        background: uiConfigs.style.mainGradient.color,
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
      }}>
        Settings
      </Typography>

      <Paper elevation={0} sx={{
        borderRadius: 4,
        bgcolor: isDark ? alpha(theme.palette.background.paper, 0.6) : alpha('#ffffff', 0.9),
        backdropFilter: "blur(20px)",
        border: "1px solid",
        borderColor: isDark ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.common.black, 0.05),
        boxShadow: isDark ? '0 16px 40px rgba(0,0,0,0.5)' : '0 16px 40px rgba(0,0,0,0.08)',
        position: 'relative',
        zIndex: 1,
        overflow: 'hidden'
      }}>
        <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row" }}>

          {/* Custom Tabs Sidebar */}
          <Box sx={{
            minWidth: 260,
            bgcolor: isDark ? alpha(theme.palette.background.default, 0.3) : alpha(theme.palette.grey[50], 0.5),
            borderRight: isMobile ? 0 : `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            borderBottom: isMobile ? `1px solid ${alpha(theme.palette.divider, 0.5)}` : 0,
            p: 2
          }}>
            <Tabs
              orientation={isMobile ? "horizontal" : "vertical"}
              variant="scrollable"
              scrollButtons={isMobile ? "auto" : false}
              value={activeTab}
              onChange={handleTabChange}
              TabIndicatorProps={{
                style: {
                  width: isMobile ? '100%' : 4,
                  height: isMobile ? 4 : 'auto',
                  borderRadius: 4,
                  background: uiConfigs.style.mainGradient.color
                }
              }}
              sx={{
                "& .MuiTab-root": {
                  alignItems: "center",
                  justifyContent: "flex-start",
                  textAlign: "left",
                  borderRadius: 2,
                  minHeight: 48,
                  my: 0.5,
                  p: 2,
                  color: "text.secondary",
                  fontWeight: 600,
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: "primary.main"
                  },
                  "&.Mui-selected": {
                    color: "primary.main",
                    bgcolor: alpha(theme.palette.primary.main, 0.12)
                  },
                },
              }}
            >
              <Tab label="Public Profile" icon={<PersonOutline sx={{ mr: 1.5 }} />} iconPosition="start" />
              <Tab label="Account Data" icon={<SecurityOutlined sx={{ mr: 1.5 }} />} iconPosition="start" />
              <Tab label="Security" icon={<Lock sx={{ mr: 1.5 }} />} iconPosition="start" />
              <Tab label="Privacy" icon={<PrivacyTip sx={{ mr: 1.5 }} />} iconPosition="start" />
              <Tab label="Preferences" icon={<Tune sx={{ mr: 1.5 }} />} iconPosition="start" />
              <Tab label="Support" icon={<HelpOutline sx={{ mr: 1.5 }} />} iconPosition="start" />
            </Tabs>
          </Box>

          {/* Main Content Area */}
          <Box sx={{ flexGrow: 1, minHeight: 600 }}>

            {/* Tab 0: PUBLIC PROFILE */}
            <TabPanel value={activeTab} index={0}>
              <Typography variant="h5" sx={{ mb: 4, fontWeight: 700 }}>Public Profile</Typography>

              <Paper elevation={0} sx={sectionPaperStyle}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>Account Information</Typography>
                <Grid container spacing={4}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Username</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>@{profile.username}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>{profile.email || user?.email}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, mt: 4 }}>Profile Details</Typography>

              {!isEditingProfile ? (
                <Paper elevation={0} sx={sectionPaperStyle}>
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: 'uppercase' }}>Full Name</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>{profile.first_name} {profile.last_name}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: 'uppercase' }}>Bio</Typography>
                      <Typography variant="body1" sx={{ mt: 0.5, color: profile.bio ? 'text.primary' : 'text.disabled' }}>
                        {profile.bio || "No biography provided yet."}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: 'uppercase' }}>Tagline</Typography>
                      <Typography variant="body1" sx={{ mt: 0.5, color: profile.tagline ? 'text.primary' : 'text.disabled' }}>
                        {profile.tagline || "No tagline set."}
                      </Typography>
                    </Box>
                  </Stack>
                  <Box sx={{ mt: 4 }}>
                    <Button
                      startIcon={<Edit />}
                      onClick={() => setIsEditingProfile(true)}
                      variant="contained"
                      sx={{
                        borderRadius: 8,
                        bgcolor: alpha(theme.palette.primary.main, 1),
                        color: 'primary.contrastText',
                        py: 1, px: 3
                      }}
                    >
                      Edit Profile
                    </Button>
                  </Box>
                </Paper>
              ) : (
                <Paper elevation={0} sx={{ ...sectionPaperStyle, borderColor: 'primary.main', boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.15)}` }}>
                  <Stack spacing={3}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField label="First Name" name="first_name" value={editData.first_name || ""} onChange={handleProfileChange} fullWidth variant="outlined" />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField label="Last Name" name="last_name" value={editData.last_name || ""} onChange={handleProfileChange} fullWidth variant="outlined" />
                      </Grid>
                    </Grid>
                    <TextField label="Tagline" name="tagline" value={editData.tagline || ""} onChange={handleProfileChange} fullWidth variant="outlined" placeholder="e.g., Passionate learner" />
                    <TextField label="Bio" name="bio" value={editData.bio || ""} onChange={handleProfileChange} fullWidth multiline rows={4} variant="outlined" placeholder="Tell us about yourself..." />

                    <Box sx={{ display: "flex", gap: 2, pt: 2 }}>
                      <LoadingButton
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleSaveProfile}
                        loading={isSubmitting}
                        sx={{ background: uiConfigs.style.mainGradient.color, color: "white", borderRadius: 8, px: 4 }}
                      >
                        Save Changes
                      </LoadingButton>
                      <Button
                        variant="outlined"
                        startIcon={<Close />}
                        onClick={() => { setIsEditingProfile(false); setEditData(profile); }}
                        sx={{ borderRadius: 8, px: 3 }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Stack>
                </Paper>
              )}
            </TabPanel>

            {/* Tab 1: ACCOUNT DATA */}
            <TabPanel value={activeTab} index={1}>
              <Typography variant="h5" sx={{ mb: 4, fontWeight: 700 }}>Account Data & Learning Styles</Typography>

              <Paper elevation={0} sx={sectionPaperStyle}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>Email Address</Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>{profile.email || user?.email}</Typography>
                  </Box>
                  <Chip label="Verified" color="success" size="small" variant="outlined" icon={<VerifiedUser />} />
                </Box>
                <Typography variant="caption" sx={{ color: "text.disabled", display: "block", mt: 2 }}>
                  Email addresses cannot be changed for security reasons. Contact support if needed.
                </Typography>
              </Paper>

              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, mt: 4 }}>Learning Style Preferences</Typography>

              {!isEditingLearningStyle ? (
                <Paper elevation={0} sx={sectionPaperStyle}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>Current Active Profile Type</Typography>
                      <Chip
                        icon={<CheckCircle />}
                        label={learningStyleSource === "manual" ? "Manual Adjustments" : learningStyleSource === "questionnaire" ? "Questionnaire Profile" : "Interactive Profile"}
                        color="success"
                        sx={{ fontWeight: 600, bgcolor: alpha(theme.palette.success.main, 0.1) }}
                      />
                    </Box>
                    <Button
                      startIcon={<Edit />}
                      onClick={() => setIsEditingLearningStyle(true)}
                      variant="outlined"
                      color="primary"
                      sx={{ borderRadius: 8 }}
                    >
                      Calibrate Values
                    </Button>
                  </Box>

                  <Grid container spacing={3}>
                    {['active_reflective', 'sensing_intuitive', 'visual_verbal', 'sequential_global'].map((dim) => {
                      const value = (learningStyleSource === "manual" ? learningStyleAdjustments : profile.learning_styles)?.[dim] || 0;
                      const progress = ((value + 11) / 22) * 100;
                      const labels = {
                        active_reflective: ["Active", "Reflective"],
                        sensing_intuitive: ["Sensing", "Intuitive"],
                        visual_verbal: ["Visual", "Verbal"],
                        sequential_global: ["Sequential", "Global"]
                      }[dim];

                      return (
                        <Grid item xs={12} sm={6} key={dim}>
                          <Box sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                              <Typography variant="caption" sx={{ fontWeight: 700 }}>{labels[0]}</Typography>
                              <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>Val: {value}</Typography>
                              <Typography variant="caption" sx={{ fontWeight: 700 }}>{labels[1]}</Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={progress}
                              sx={{
                                height: 8, borderRadius: 4,
                                bgcolor: alpha(theme.palette.divider, 0.5),
                                "& .MuiLinearProgress-bar": { background: uiConfigs.style.mainGradient.color }
                              }}
                            />
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Paper>
              ) : (
                <Paper elevation={0} sx={{ ...sectionPaperStyle, borderColor: 'primary.main', boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.15)}` }}>
                  <Alert severity="info" sx={{ mb: 4, borderRadius: 3 }}>
                    Use the sliders below to manually override your learning style. Values range from -11 to +11.
                  </Alert>

                  <Stack spacing={4}>
                    {[
                      { key: 'active_reflective', left: 'Active (Do-ers)', right: 'Reflective (Thinkers)' },
                      { key: 'sensing_intuitive', left: 'Sensing (Facts)', right: 'Intuitive (Concepts)' },
                      { key: 'visual_verbal', left: 'Visual (Diagrams)', right: 'Verbal (Words)' },
                      { key: 'sequential_global', left: 'Sequential (Linear)', right: 'Global (Big Picture)' }
                    ].map(({ key, left, right }) => (
                      <Box key={key} sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{left}</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 800, color: "primary.main" }}>{learningStyleAdjustments[key]}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{right}</Typography>
                        </Box>
                        <input
                          type="range" min="-11" max="11"
                          value={learningStyleAdjustments[key]}
                          onChange={(e) => handleLearningStyleChange(key, parseInt(e.target.value))}
                          style={{
                            width: "100%", accentColor: theme.palette.primary.main,
                            height: '6px', cursor: 'grab'
                          }}
                        />
                      </Box>
                    ))}

                    <Box sx={{ display: "flex", gap: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                      <LoadingButton
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleSaveLearningStyleAdjustments}
                        loading={isSubmitting}
                        sx={{ background: uiConfigs.style.mainGradient.color, color: "white", borderRadius: 8, px: 4 }}
                      >
                        Save Adjustments
                      </LoadingButton>
                      <Button
                        variant="outlined"
                        startIcon={<Close />}
                        onClick={() => setIsEditingLearningStyle(false)}
                        sx={{ borderRadius: 8, px: 3 }}
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
              <Typography variant="h5" sx={{ mb: 4, fontWeight: 700 }}>Security Settings</Typography>

              <Paper elevation={0} sx={sectionPaperStyle}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Password</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
                  Ensure your account is using a long, random password to stay secure.
                </Typography>
                <LoadingButton
                  variant="outlined"
                  startIcon={<Lock />}
                  onClick={handleResetPassword}
                  loading={isSubmitting}
                  sx={{ borderRadius: 8 }}
                >
                  Send Reset Link
                </LoadingButton>
              </Paper>

              <Paper elevation={0} sx={sectionPaperStyle}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Two-Factor Authentication</Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 400 }}>
                      Protect your account against unauthorized access with an additional layer of security.
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, borderRadius: '50%', bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                    <SecurityOutlined sx={{ color: "warning.main", fontSize: 32 }} />
                  </Box>
                </Box>
                <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>Status: Not Configured</Alert>
                <Button variant="contained" color="primary" sx={{ borderRadius: 8, px: 3 }} onClick={handleEnable2FA}>
                  Setup 2FA
                </Button>
              </Paper>
            </TabPanel>

            {/* Tab 3: PRIVACY */}
            <TabPanel value={activeTab} index={3}>
              <Typography variant="h5" sx={{ mb: 4, fontWeight: 700 }}>Privacy Settings</Typography>

              <Stack spacing={3}>
                <Paper elevation={0} sx={{ ...sectionPaperStyle, mb: 0 }}>
                  <FormControlLabel
                    control={<Switch checked={privacy.profilePublic} onChange={() => handlePrivacyChange("profilePublic")} color="primary" />}
                    label={
                      <Box sx={{ ml: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Public Profile</Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>Make your profile visible to other users in the platform.</Typography>
                      </Box>
                    }
                  />
                </Paper>
                <Paper elevation={0} sx={{ ...sectionPaperStyle, mb: 0 }}>
                  <FormControlLabel
                    control={<Switch checked={privacy.showLearningStats} onChange={() => handlePrivacyChange("showLearningStats")} color="primary" />}
                    label={
                      <Box sx={{ ml: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Show Learning Statistics</Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>Display your learning style matrix to other users.</Typography>
                      </Box>
                    }
                  />
                </Paper>
                <Paper elevation={0} sx={{ ...sectionPaperStyle, mb: 0 }}>
                  <FormControlLabel
                    control={<Switch checked={privacy.allowMessages} onChange={() => handlePrivacyChange("allowMessages")} color="primary" />}
                    label={
                      <Box sx={{ ml: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Direct Messaging</Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>Allow other users to send you direct messages.</Typography>
                      </Box>
                    }
                  />
                </Paper>
              </Stack>
            </TabPanel>

            {/* Tab 4: PREFERENCES */}
            <TabPanel value={activeTab} index={4}>
              <Typography variant="h5" sx={{ mb: 4, fontWeight: 700 }}>App Preferences</Typography>

              <Paper elevation={0} sx={sectionPaperStyle}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Language</Typography>
                <TextField select value={settings.language} onChange={(e) => setSettings({ ...settings, language: e.target.value })} fullWidth variant="outlined" sx={{ maxWidth: 300 }}>
                  <MenuItem value="en">🇬🇧 English</MenuItem>
                  <MenuItem value="es">🇪🇸 Español</MenuItem>
                  <MenuItem value="fr">🇫🇷 Français</MenuItem>
                </TextField>
              </Paper>

              <Paper elevation={0} sx={sectionPaperStyle}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>Data Management</Typography>
                <Stack spacing={3}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>Chat History</Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>Clear all previous conversations with AI agents.</Typography>
                    </Box>
                    <Button variant="outlined" color="error" sx={{ borderRadius: 8 }} onClick={() => setOpenClearHistoryDialog(true)}>Clear Chats</Button>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>Application Cache</Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>Clear document and asset cache to free up space.</Typography>
                    </Box>
                    <Button variant="outlined" color="warning" sx={{ borderRadius: 8 }} onClick={() => setOpenClearCacheDialog(true)}>Clear Cache</Button>
                  </Box>
                </Stack>
              </Paper>
            </TabPanel>

            {/* Tab 5: SUPPORT */}
            <TabPanel value={activeTab} index={5}>
              <Typography variant="h5" sx={{ mb: 4, fontWeight: 700 }}>Support & Feedback</Typography>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6}>
                  <Paper elevation={0} sx={{ ...sectionPaperStyle, cursor: "pointer", display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.1), color: "info.main" }}>
                      <HelpOutline fontSize="medium" />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Help Center</Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>Read the manuals</Typography>
                    </Box>
                    <OpenInNew sx={{ color: "text.disabled", fontSize: 20 }} />
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper elevation={0} sx={{ ...sectionPaperStyle, cursor: "pointer", display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.1), color: "success.main" }}>
                      <CheckCircle fontSize="medium" />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>System Status</Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>All systems operational</Typography>
                    </Box>
                    <OpenInNew sx={{ color: "text.disabled", fontSize: 20 }} />
                  </Paper>
                </Grid>
              </Grid>

              <Paper elevation={0} sx={sectionPaperStyle}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Submit an Issue</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>Have you encountered a bug or error? Let us know below.</Typography>

                <Stack spacing={3}>
                  <TextField label="Issue Title" fullWidth variant="outlined" value={issueReport.title} onChange={(e) => setIssueReport({ ...issueReport, title: e.target.value })} />
                  <TextField label="Description" fullWidth multiline rows={4} variant="outlined" value={issueReport.description} onChange={(e) => setIssueReport({ ...issueReport, description: e.target.value })} />
                  <TextField select label="Category" value={issueReport.category} onChange={(e) => setIssueReport({ ...issueReport, category: e.target.value })} fullWidth variant="outlined">
                    <MenuItem value="bug">Bug Report</MenuItem>
                    <MenuItem value="ui">UI/UX Issue</MenuItem>
                    <MenuItem value="performance">Performance Issue</MenuItem>
                  </TextField>
                  <Button variant="contained" onClick={handleSubmitReport} sx={{ background: uiConfigs.style.mainGradient.color, color: "white", borderRadius: 8, py: 1.5 }}>
                    Submit Report
                  </Button>
                </Stack>
              </Paper>
            </TabPanel>

          </Box>
        </Box>
      </Paper>

      {/* Dialogs */}
      <Dialog open={openClearHistoryDialog} onClose={() => setOpenClearHistoryDialog(false)} PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Clear Chat History</DialogTitle>
        <DialogContent><DialogContentText>Are you sure you want to clear all chat history? This action cannot be undone.</DialogContentText></DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenClearHistoryDialog(false)} sx={{ borderRadius: 8 }}>Cancel</Button>
          <LoadingButton onClick={handleClearChatHistory} color="error" variant="contained" loading={isSubmitting} sx={{ borderRadius: 8 }}>Clear History</LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog open={openClearCacheDialog} onClose={() => setOpenClearCacheDialog(false)} PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Clear Cache</DialogTitle>
        <DialogContent><DialogContentText>Clearing cache will free up storage space, but resources may take longer to load initially.</DialogContentText></DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenClearCacheDialog(false)} sx={{ borderRadius: 8 }}>Cancel</Button>
          <LoadingButton onClick={handleClearCache} color="warning" variant="contained" loading={isSubmitting} sx={{ borderRadius: 8 }}>Clear Cache</LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardSettingsPage;
