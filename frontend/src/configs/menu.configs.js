import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import AccessibilityIcon from "@mui/icons-material/Accessibility";
import InsertChartOutlinedOutlinedIcon from "@mui/icons-material/InsertChartOutlinedOutlined";
import FileCopyOutlinedIcon from "@mui/icons-material/FileCopyOutlined";
import YouTubeIcon from "@mui/icons-material/YouTube";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import PortraitIcon from "@mui/icons-material/Portrait";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import HistoryIcon from "@mui/icons-material/History";
import BookmarksOutlinedIcon from "@mui/icons-material/BookmarksOutlined";
import QuizIcon from "@mui/icons-material/Quiz";
import SourceIcon from "@mui/icons-material/Source";
import InsightsIcon from "@mui/icons-material/Insights";
import GraphicEqOutlinedIcon from "@mui/icons-material/GraphicEqOutlined";
import LocalLibraryOutlinedIcon from "@mui/icons-material/LocalLibraryOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import AddModeratorOutlinedIcon from "@mui/icons-material/AddModeratorOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import FormatShapesIcon from "@mui/icons-material/FormatShapes";
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import FilePresentOutlinedIcon from '@mui/icons-material/FilePresentOutlined';
import VoiceChatIcon from '@mui/icons-material/VoiceChat';

const main = [
  {
    display: "home",
    path: "/home",
    icon: <HomeOutlinedIcon />,
    state: "home",
  },
  {
    display: "features",
    path: "/features",
    icon: <AddIcon />,
    state: "feature",
  },
  {
    display: "download",
    path: "/download",
    icon: <DownloadIcon />,
    state: "download",
  },
  {
    display: "resources",
    path: "/resources",
    icon: <AccessibilityIcon />,
    state: "resources",
  },
  {
    display: "research",
    path: "/research",
    icon: <AccessibilityIcon />,
    state: "research",
  },
];

const footMenu = [
  {
    display: "about",
    path: "/about",
    state: "about",
  },
  {
    display: "technology",
    path: "/technology",
    state: "technology",
  },
  // {
  //   display: "team",
  //   path: "/team",
  //   state: "team",
  // },
  {
    display: "privacy",
    path: "/privacy",
    state: "privacy",
  },
];
const socialMedia = [
  {
    path: "#",
    icon: <YouTubeIcon fontSize="large" />,
    state: "youtube",
  },
  {
    path: "#",
    icon: <FacebookIcon fontSize="large" />,
    state: "facebook",
  },
  {
    path: "#",
    icon: <InstagramIcon fontSize="large" />,
    state: "instagram",
  },
];

const user = [
  {
    display: "profile",
    path: "/dashboard/profile",
    icon: <PortraitIcon />,
    state: "profile",
  },
  {
    display: "updates",
    path: "/dashboard/updates",
    icon: <AddModeratorOutlinedIcon />,
    state: "updates",
  },
  {
    display: "settings",
    path: "/dashboard/settings",
    icon: <SettingsOutlinedIcon />,
    state: "settings",
  },
];

const dashboardPlatform = [
  {
    display: "My Learning",
    path: "/dashboard/platform/",
    icon: <LocalLibraryOutlinedIcon />,
    state: "eduplatform",
  },
  {
    display: "Lessons",
    path: "/dashboard/platform/lessons",
    icon: <FormatShapesIcon />,
    state: "platform-lessons",
  },
  {
    display: "Notes",
    path: "/dashboard/platform/notes",
    icon: <DescriptionOutlinedIcon />,
    state: "platform-notes",
  },
  {
    display: "Community",
    path: "/dashboard/platform/community",
    icon: <PeopleOutlinedIcon />,
    state: "platform-community",
  },
];

const dashboardChat = [
  {
    display: "Edu - Chat",
    path: "/dashboard/chat/new",
    icon: <ChatOutlinedIcon />,
    state: "educhat",
  },
  {
    display: "History",
    path: "/dashboard/chat/history",
    icon: <HistoryIcon />,
    state: "chat-history",
  },
  {
    display: "Bookmarks",
    path: "/dashboard/chat/bookmarks",
    icon: <BookmarksOutlinedIcon />,
    state: "chat-bookmarks",
  },
];

const dashboardCommon = [
  {
    display: "Quizzes",
    path: "/dashboard/quizzes",
    icon: <QuizIcon />,
    state: "quizzes",
  },
  {
    display: "Documents",
    path: "/dashboard/documents",
    icon: <SourceIcon />,
    state: "documents",
  },
  {
    display: "Analytics",
    path: "/dashboard/analytics",
    icon: <InsightsIcon />,
    state: "analytics",
  },
  {
    display: "Mine Horizon",
    path: "/dashboard/mine-horizon",
    icon: <GraphicEqOutlinedIcon />,
    state: "minehorizon",
  },
];
const platformMenu = [
  {
    display: "Lessons",
    path: "/dashboard/platform/lessons",
    icon: <FormatShapesIcon />,
    state: "platform-menu-lessons",
  },
  {
    display: "Edits",
    path: "/dashboard/platform/lessons",
    icon: <EditNoteOutlinedIcon />,
    state: "platform-menu-edits",
  },
  {
    display: "Notes",
    path: "/dashboard/platform/lessons",
    icon: <DescriptionOutlinedIcon />,
    state: "platform-menu-notes",
  },
  {
    display: "Resources",
    path: "/dashboard/platform/lessons",
    icon: <FilePresentOutlinedIcon />,
    state: "platform-menu-resources",
  },
  {
    display: "Voice & Chat",
    path: "/dashboard/platform/lessons",
    icon: <VoiceChatIcon />,
    state: "platform-menu-voicechat",
  },
  
];


const menuConfigs = {
  main,
  footMenu,
  socialMedia,
  user,
  dashboardChat,
  dashboardCommon,
  dashboardPlatform,
  platformMenu,
};

export default menuConfigs;
