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
import QuizIcon from '@mui/icons-material/Quiz';
import SourceIcon from '@mui/icons-material/Source';
import InsightsIcon from '@mui/icons-material/Insights';
import GraphicEqOutlinedIcon from '@mui/icons-material/GraphicEqOutlined';

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
  {
    display: "team",
    path: "/team",
    state: "team",
  },
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
    display: "progress",
    path: "/dashboard/progress",
    icon: <InsertChartOutlinedOutlinedIcon />,
    state: "progress",
  },
  {
    display: "documents",
    path: "/dashboard/documents",
    icon: <FileCopyOutlinedIcon />,
    state: "documents",
  },
];

const dashboardChat = [
  {
    display: "Edu - Chat",
    path: "/dashboard/chat",
    icon: <ChatOutlinedIcon />,
    state: "educhat",
  },
  {
    display: "History",
    path: "/dashboard/chat-hitory",
    icon: <HistoryIcon />,
    state: "chathitory",
  },
  {
    display: "Bookmarks",
    path: "/dashboard/chat-bookmarks",
    icon: <BookmarksOutlinedIcon />,
    state: "chatbookmarks",
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

const menuConfigs = { main, footMenu, socialMedia, user, dashboardChat, dashboardCommon };

export default menuConfigs;
