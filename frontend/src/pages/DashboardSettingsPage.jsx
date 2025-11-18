import React, { useState } from "react";
import {
  Box,
  Container,
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
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {
  PersonOutline,
  SecurityOutlined,
  Tune,
  HelpOutline,
  Info,
  Edit,
  Lock,
  Delete,
  MoreHoriz,
  BugReport,
  MenuBook,
  Description,
  PrivacyTip,
  Gavel,
  ExpandMore,
  OpenInNew,
  CheckCircle,
  EnhancedEncryption,
} from "@mui/icons-material";
import uiConfigs from "../configs/ui.config";
import { toast } from "react-toastify";

// Tab Panel Component
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
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openDeleteAccountDialog, setOpenDeleteAccountDialog] = useState(false);

  // Form states
  const [profileData, setProfileData] = useState({
    firstName: "John",
    lastName: "Doe",
    bio: "Passionate learner and educator",
  });

  const [accountData, setAccountData] = useState({
    username: "johndoe",
    email: "john@example.com",
  });

  const [settings, setSettings] = useState({
    language: "en",
    accessibility: false,
    clearChat: false,
    history: true,
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Profile handlers
  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileSave = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Account handlers
  const handleAccountChange = (e) => {
    setAccountData({
      ...accountData,
      [e.target.name]: e.target.value,
    });
  };

  const handleChangeUsername = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Username changed successfully!");
    } catch (error) {
      toast.error("Failed to change username");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = () => {
    toast.info("Password reset email has been sent to your email address");
  };

  const handleDeleteAccount = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Account deleted successfully");
      // Redirect to home page after deletion
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error) {
      toast.error("Failed to delete account");
    } finally {
      setIsSubmitting(false);
      setOpenDeleteAccountDialog(false);
    }
  };

  // Settings handlers
  const handleSettingsChange = (setting) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting],
    });
  };

  const handleLanguageChange = (e) => {
    setSettings({
      ...settings,
      language: e.target.value,
    });
  };

  return (
    <Box sx={{ gap: 3, display: "flex", flexDirection: "column" }}>
      <Typography variant="h5" sx={{}}>
        Settings
      </Typography>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: 1,
          borderColor: "graycolor.two",
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: "flex", gap: 0 }}>
          {/* Vertical Tabs */}
          <Tabs
            orientation="vertical"
            variant="scrollable"
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              borderRight: 1,
              borderColor: "divider",
              minWidth: 250,
              pr: 3,
              "& .MuiTab-root": {
                alignItems: "center",
                textAlign: "left",
                borderRadius: 3,
                transition: "all 0.2s ease",
                justifyContent: "flex-start",
                "&:hover": {
                  bgcolor: "action.hover",
                },
                "&.Mui-selected": {
                  bgcolor: "primary.lighter",
                  color: "primary.main",
                  fontWeight: 600,
                },
              },
              "& .MuiTabs-indicator": {
                width: 3,
                borderRadius: "0 2px 2px 0",
                right: 0,
              },
            }}
          >
            {/* Profile Section */}
            <Tab
              label="Public Profile"
              icon={<PersonOutline sx={{}} />}
              iconPosition="start"
            />

            {/* Account Section */}
            <Tab
              label="Account"
              icon={<SecurityOutlined sx={{}} />}
              iconPosition="start"
            />

            <Tab
              label="Security"
              icon={<EnhancedEncryption sx={{}} />}
              iconPosition="start"
            />

            <Divider sx={{ my: 2 }} />

            {/* Settings Section */}
            <Tab
              label="Content & Activity"
              icon={<Tune sx={{}} />}
              iconPosition="start"
            />

            {/* Support Section */}
            <Tab
              label="Report a Problem"
              icon={<BugReport sx={{}} />}
              iconPosition="start"
            />

            <Tab
              label="Help & Support"
              icon={<HelpOutline sx={{}} />}
              iconPosition="start"
            />

            <Divider sx={{ my: 2 }} />

            {/* About Section */}
            <Tab
              label="Guidelines"
              icon={<MenuBook sx={{}} />}
              iconPosition="start"
            />

            <Tab
              label="Privacy Policy"
              icon={<PrivacyTip sx={{}} />}
              iconPosition="start"
            />

            <Tab
              label="Terms & Conditions"
              icon={<Gavel sx={{}} />}
              iconPosition="start"
            />

            <Tab label="About" icon={<Info sx={{}} />} iconPosition="start" />
          </Tabs>

          {/* Tab Content */}
          <Box sx={{ flexGrow: 1, bgcolor: "background.paper" }}>
            {/* PUBLIC PROFILE TAB */}
            <TabPanel value={activeTab} index={0}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Edit Your Public Profile
              </Typography>

              <Box sx={{}}>
                {!isEditing ? (
                  <Box>
                    <Paper sx={{ p: 2.5, mb: 3, bgcolor: "action.hover" }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "start",
                          mb: 2,
                        }}
                      >
                        <Box>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 600 }}
                          >
                            {profileData.firstName} {profileData.lastName}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{ mt: 1 }}
                          >
                            {profileData.bio}
                          </Typography>
                        </Box>
                        <Button
                          startIcon={<Edit />}
                          onClick={() => setIsEditing(true)}
                          variant="text"
                          size="small"
                        >
                          Edit
                        </Button>
                      </Box>
                    </Paper>
                  </Box>
                ) : (
                  <Box>
                    <Stack spacing={2}>
                      <TextField
                        label="First Name"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleProfileChange}
                        fullWidth
                        variant="outlined"
                      />
                      <TextField
                        label="Last Name"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleProfileChange}
                        fullWidth
                        variant="outlined"
                      />
                      <TextField
                        label="Bio"
                        name="bio"
                        value={profileData.bio}
                        onChange={handleProfileChange}
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        placeholder="Tell the community about yourself..."
                      />
                    </Stack>

                    <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                      <LoadingButton
                        variant="contained"
                        onClick={handleProfileSave}
                        loading={isSubmitting}
                        sx={{
                          background: uiConfigs.style.mainGradient.color,
                          color: "secondary.contrastText",
                        }}
                      >
                        Save Changes
                      </LoadingButton>
                      <Button
                        variant="outlined"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            </TabPanel>

            {/* ACCOUNT TAB */}
            <TabPanel value={activeTab} index={1}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Account Settings
              </Typography>

              <Stack spacing={3} sx={{}}>
                {/* Change Username */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 2 }}
                  >
                    Change Username
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <TextField
                      label="Username"
                      value={accountData.username}
                      onChange={handleAccountChange}
                      name="username"
                      size="small"
                      sx={{ flex: 1 }}
                    />
                    <LoadingButton
                      variant="contained"
                      onClick={handleChangeUsername}
                      loading={isSubmitting}
                      sx={{
                        background: uiConfigs.style.mainGradient.color,
                        color: "secondary.contrastText",
                      }}
                    >
                      Update
                    </LoadingButton>
                  </Box>
                </Box>

                <Divider />

                {/* Password Reset */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 2 }}
                  >
                    Password & Security
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mb: 2 }}
                  >
                    Secure your account with a strong password
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Lock />}
                    onClick={handleResetPassword}
                  >
                    Reset Password
                  </Button>
                </Box>

                <Divider />

                {/* Delete Account */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 2 }}
                  >
                    Delete Account
                  </Typography>
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    ⚠️ Deleting your account is permanent and cannot be undone.
                    All your data will be permanently deleted.
                  </Alert>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => setOpenDeleteAccountDialog(true)}
                  >
                    Delete My Account
                  </Button>
                </Box>
              </Stack>
            </TabPanel>

            {/* CONTENT & ACTIVITY TAB */}
            <TabPanel value={activeTab} index={2}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Content & Activity Preferences
              </Typography>

              <Stack spacing={3} sx={{  }}>
                {/* Language */}
                <Card elevation={0} sx={{ p: 2.5, bgcolor: "action.hover" }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 2 }}
                  >
                    🌐 System Language
                  </Typography>
                  <TextField
                    select
                    value={settings.language}
                    onChange={handleLanguageChange}
                    fullWidth
                    size="small"
                    variant="outlined"
                  >
                    <MenuItem value="en">🇬🇧 English</MenuItem>
                    <MenuItem value="es">🇪🇸 Español</MenuItem>
                    <MenuItem value="fr">🇫🇷 Français</MenuItem>
                    <MenuItem value="de">🇩🇪 Deutsch</MenuItem>
                    <MenuItem value="zh">🇨🇳 中文</MenuItem>
                  </TextField>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ mt: 1, display: "block" }}
                  >
                    Changes the interface language across the platform
                  </Typography>
                </Card>

                <Divider />

                {/* Accessibility */}
                <Card elevation={0} sx={{ p: 2.5, bgcolor: "action.hover" }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.accessibility}
                        onChange={() => handleSettingsChange("accessibility")}
                      />
                    }
                    label={
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600 }}
                        >
                          ♿ Accessibility Mode
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Enhanced text size, contrast, and reading support
                        </Typography>
                      </Box>
                    }
                  />
                </Card>

                <Divider />

                {/* Chat Settings */}
                <Card elevation={0} sx={{ p: 2.5, bgcolor: "action.hover" }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 2 }}
                  >
                    💬 Chat & History Settings
                  </Typography>
                  <Stack spacing={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.history}
                          onChange={() => handleSettingsChange("history")}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Save Chat History
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Keep record of conversations for future reference
                          </Typography>
                        </Box>
                      }
                    />
                    <Button
                      variant="outlined"
                      color="warning"
                      onClick={() => setOpenDeleteDialog(true)}
                    >
                      Clear All Chat History
                    </Button>
                  </Stack>
                </Card>
              </Stack>
            </TabPanel>

            {/* REPORT A PROBLEM TAB */}
            <TabPanel value={activeTab} index={3}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Report a Problem
              </Typography>

              <Stack spacing={2} sx={{  }}>
                <Alert severity="info" icon={<BugReport />}>
                  Help us improve by reporting any issues you encounter. Your
                  feedback is valuable!
                </Alert>

                <Card elevation={0} sx={{ p: 2.5, bgcolor: "action.hover" }}>
                  <Stack spacing={2}>
                    <TextField
                      label="Issue Title"
                      placeholder="Brief description of the problem"
                      fullWidth
                      variant="outlined"
                    />
                    <TextField
                      label="Description"
                      placeholder="Provide detailed information about the issue..."
                      fullWidth
                      multiline
                      rows={4}
                      variant="outlined"
                    />
                    <TextField
                      select
                      label="Issue Category"
                      defaultValue="bug"
                      fullWidth
                      variant="outlined"
                    >
                      <MenuItem value="bug">🐛 Bug Report</MenuItem>
                      <MenuItem value="feature">💡 Feature Request</MenuItem>
                      <MenuItem value="performance">
                        ⚡ Performance Issue
                      </MenuItem>
                      <MenuItem value="ui">🎨 UI/UX Issue</MenuItem>
                      <MenuItem value="other">📝 Other</MenuItem>
                    </TextField>
                    <Button
                      variant="contained"
                      sx={{
                        background: uiConfigs.style.mainGradient.color,
                        color: "secondary.contrastText",
                      }}
                    >
                      Submit Report
                    </Button>
                  </Stack>
                </Card>
              </Stack>
            </TabPanel>

            {/* HELP & SUPPORT TAB */}
            <TabPanel value={activeTab} index={4}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Help & Support
              </Typography>

              <Stack spacing={2} sx={{ }}>
                {/* Help Center */}
                <Paper
                  sx={{
                    p: 2.5,
                    cursor: "pointer",
                    transition: "all 0.3s",
                    border: "1px solid",
                    borderColor: "divider",
                    "&:hover": {
                      boxShadow: 3,
                      transform: "translateY(-4px)",
                      borderColor: "primary.main",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        📚 Help Center
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mb: 2 }}
                      >
                        Browse comprehensive guides, tutorials, and common
                        questions answered by our support team
                      </Typography>
                    </Box>
                    <OpenInNew sx={{ fontSize: 20, color: "primary.main" }} />
                  </Box>
                  <Button
                    variant="text"
                    size="small"
                    sx={{ color: "primary.main", mt: 1 }}
                  >
                    Visit Help Center
                  </Button>
                </Paper>

                {/* Documentation */}
                <Paper
                  sx={{
                    p: 2.5,
                    cursor: "pointer",
                    transition: "all 0.3s",
                    border: "1px solid",
                    borderColor: "divider",
                    "&:hover": {
                      boxShadow: 3,
                      transform: "translateY(-4px)",
                      borderColor: "primary.main",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        📖 Documentation
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mb: 2 }}
                      >
                        Read detailed technical documentation, API guides, and
                        integration tutorials
                      </Typography>
                    </Box>
                    <OpenInNew sx={{ fontSize: 20, color: "primary.main" }} />
                  </Box>
                  <Button
                    variant="text"
                    size="small"
                    sx={{ color: "primary.main", mt: 1 }}
                  >
                    View Documentation
                  </Button>
                </Paper>

                {/* FAQ */}
                <Paper
                  sx={{
                    p: 2.5,
                    cursor: "pointer",
                    transition: "all 0.3s",
                    border: "1px solid",
                    borderColor: "divider",
                    "&:hover": {
                      boxShadow: 3,
                      transform: "translateY(-4px)",
                      borderColor: "primary.main",
                    },
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 2 }}
                  >
                    ❓ Frequently Asked Questions
                  </Typography>

                  <Stack spacing={1}>
                    <Accordion defaultExpanded disableGutters>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          How do I change my learning style preferences?
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" color="textSecondary">
                          You can update your learning style preferences in the
                          Content & Activity tab. Our AI will continuously adapt
                          to your preferences based on your interaction
                          patterns.
                        </Typography>
                      </AccordionDetails>
                    </Accordion>

                    <Accordion disableGutters>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Can I delete my chat history?
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" color="textSecondary">
                          Yes, you can clear your chat history from the Content
                          & Activity tab. Once deleted, this action cannot be
                          undone.
                        </Typography>
                      </AccordionDetails>
                    </Accordion>

                    <Accordion disableGutters>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          How secure is my personal data?
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" color="textSecondary">
                          We implement industry-standard encryption and security
                          measures to protect your data. Please refer to our
                          Privacy Policy for detailed information.
                        </Typography>
                      </AccordionDetails>
                    </Accordion>

                    <Accordion disableGutters>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          What languages are supported?
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" color="textSecondary">
                          Currently, we support English, Spanish, French,
                          German, and Chinese. More languages are coming soon!
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  </Stack>
                </Paper>
              </Stack>
            </TabPanel>

            {/* GUIDELINES TAB */}
            <TabPanel value={activeTab} index={5}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Community Guidelines
              </Typography>

              <Stack spacing={2} sx={{ }}>
                <Alert severity="info">
                  These guidelines help us maintain a positive and productive
                  learning community for everyone.
                </Alert>

                <Paper sx={{ p: 2.5, bgcolor: "action.hover" }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 2 }}
                  >
                    ✅ Do's
                  </Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <CheckCircle
                        sx={{ color: "success.main", flexShrink: 0, mt: 0.5 }}
                      />
                      <Typography variant="body2">
                        Be respectful and courteous to all community members
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <CheckCircle
                        sx={{ color: "success.main", flexShrink: 0, mt: 0.5 }}
                      />
                      <Typography variant="body2">
                        Share constructive feedback and learning experiences
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <CheckCircle
                        sx={{ color: "success.main", flexShrink: 0, mt: 0.5 }}
                      />
                      <Typography variant="body2">
                        Help others by sharing knowledge and resources
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <CheckCircle
                        sx={{ color: "success.main", flexShrink: 0, mt: 0.5 }}
                      />
                      <Typography variant="body2">
                        Report inappropriate content or behavior
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>

                <Paper sx={{ p: 2.5, bgcolor: "error.lighter", opacity: 0.7 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 2 }}
                  >
                    ❌ Don'ts
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      • Harassment, discrimination, or hateful speech
                    </Typography>
                    <Typography variant="body2">
                      • Spam, advertising, or self-promotion
                    </Typography>
                    <Typography variant="body2">
                      • Sharing personal information of others
                    </Typography>
                    <Typography variant="body2">
                      • Cheating, plagiarism, or unauthorized content usage
                    </Typography>
                    <Typography variant="body2">
                      • Exploiting platform vulnerabilities or security issues
                    </Typography>
                  </Stack>
                </Paper>
              </Stack>
            </TabPanel>

            {/* PRIVACY POLICY TAB */}
            <TabPanel value={activeTab} index={6}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Privacy Policy
              </Typography>

              <Stack spacing={2} sx={{ }}>
                <Alert severity="info">Last updated: November 17, 2024</Alert>

                <Paper sx={{ p: 2.5, bgcolor: "action.hover" }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 2 }}
                  >
                    📋 Overview
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mb: 2 }}
                  >
                    At EduWingz, we are committed to protecting your privacy and
                    ensuring you have a positive experience. This policy
                    explains our practices regarding data collection, usage, and
                    protection.
                  </Typography>

                  <Stack spacing={2}>
                    <Accordion disableGutters>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          1. Information We Collect
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" color="textSecondary">
                          • Account information (name, email, username)
                          <br />
                          • Learning profile data (preferences, progress)
                          <br />
                          • Usage analytics and interaction patterns
                          <br />
                          • Chat history and learning interactions
                          <br />• Device information and IP address
                        </Typography>
                      </AccordionDetails>
                    </Accordion>

                    <Accordion disableGutters>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          2. How We Use Your Data
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" color="textSecondary">
                          • Personalize your learning experience
                          <br />
                          • Improve our AI algorithms
                          <br />
                          • Send important notifications
                          <br />
                          • Analyze platform usage and performance
                          <br />• Comply with legal obligations
                        </Typography>
                      </AccordionDetails>
                    </Accordion>

                    <Accordion disableGutters>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          3. Data Security
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" color="textSecondary">
                          We implement industry-standard encryption and security
                          protocols. Your data is protected using SSL/TLS
                          encryption and stored in secure, compliant servers. We
                          regularly audit our security practices.
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  </Stack>
                </Paper>

                <Button variant="outlined" endIcon={<OpenInNew />} fullWidth>
                  Read Full Privacy Policy
                </Button>
              </Stack>
            </TabPanel>

            {/* TERMS & CONDITIONS TAB */}
            <TabPanel value={activeTab} index={7}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Terms & Conditions
              </Typography>

              <Stack spacing={2} sx={{  }}>
                <Alert severity="warning">
                  Last updated: November 17, 2024 • Please review these terms
                  carefully
                </Alert>

                <Paper sx={{ p: 2.5, bgcolor: "action.hover" }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 2 }}
                  >
                    ⚖️ Key Terms
                  </Typography>

                  <Stack spacing={2}>
                    <Accordion disableGutters>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          1. User Agreement
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" color="textSecondary">
                          By using EduWingz, you agree to comply with these
                          terms. You must be at least 13 years old or have
                          parental consent. You are responsible for maintaining
                          your account security.
                        </Typography>
                      </AccordionDetails>
                    </Accordion>

                    <Accordion disableGutters>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          2. Intellectual Property Rights
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" color="textSecondary">
                          All content on EduWingz is protected by copyright. You
                          may use educational content for personal learning
                          only. Commercial use or redistribution is not
                          permitted without written permission.
                        </Typography>
                      </AccordionDetails>
                    </Accordion>

                    <Accordion disableGutters>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          3. Limitation of Liability
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" color="textSecondary">
                          EduWingz is provided "as-is". We are not liable for
                          indirect, incidental, or consequential damages. Our
                          total liability is limited to the amount paid for
                          services.
                        </Typography>
                      </AccordionDetails>
                    </Accordion>

                    <Accordion disableGutters>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          4. Termination
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" color="textSecondary">
                          We may terminate accounts that violate these terms.
                          Upon termination, your access to all services will be
                          immediately revoked.
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  </Stack>
                </Paper>

                <Button variant="outlined" endIcon={<OpenInNew />} fullWidth>
                  Read Full Terms & Conditions
                </Button>
              </Stack>
            </TabPanel>

            {/* ABOUT TAB */}
            <TabPanel value={activeTab} index={8}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                About EduWingz
              </Typography>

              <Stack spacing={3} sx={{  }}>
                <Paper sx={{ p: 2.5, bgcolor: "action.hover" }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 2 }}
                  >
                    🚀 About Our Platform
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mb: 2 }}
                  >
                    EduWingz is revolutionizing education by creating an
                    intelligent AI teaching assistant that adapts to your unique
                    learning style. We believe that learning should be
                    personalized, engaging, and effective for everyone.
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Our mission is to make quality education accessible and
                    personalized for learners worldwide, empowering them to
                    achieve their full potential through adaptive learning
                    technology.
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2.5, bgcolor: "action.hover" }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 2 }}
                  >
                    🎯 Key Features
                  </Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Chip
                        label="AI Personalization"
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label="Adaptive Learning"
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Chip
                        label="Real-time Support"
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label="Analytics Dashboard"
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Chip
                        label="Multi-language"
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label="Accessibility Ready"
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Stack>
                </Paper>

                <Paper sx={{ p: 2.5, bgcolor: "primary.lighter" }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    📦 Version Information
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    EduWingz v1.0.0
                  </Typography>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    display="block"
                    sx={{ mb: 1 }}
                  >
                    Build: 2024.11.17 (November 17, 2024)
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    display="block"
                  >
                    © 2024 EduWingz. All rights reserved. Powered by AI
                    Technology.
                  </Typography>
                </Paper>
              </Stack>
            </TabPanel>
          </Box>
        </Box>
      </Paper>

      {/* Delete Chat History Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Clear Chat History</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to clear your chat history? This action cannot
            be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={() => {
              setOpenDeleteDialog(false);
              toast.success("Chat history cleared successfully");
            }}
            color="error"
            variant="contained"
          >
            Clear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog
        open={openDeleteAccountDialog}
        onClose={() => setOpenDeleteAccountDialog(false)}
      >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you absolutely sure you want to delete your account? This action
            is <strong>permanent</strong> and cannot be undone. All your data,
            including:
          </DialogContentText>
          <List sx={{ my: 2 }}>
            <ListItem>
              <ListItemText primary="Your profile information" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Learning history and progress" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Chat history" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Saved documents and notes" />
            </ListItem>
          </List>
          <DialogContentText>
            will be permanently deleted from our servers.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteAccountDialog(false)}>
            Cancel
          </Button>
          <LoadingButton
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
            loading={isSubmitting}
          >
            Delete Account
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardSettingsPage;
