import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import AccessibilityIcon from "@mui/icons-material/Accessibility";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import YouTubeIcon from "@mui/icons-material/YouTube";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import HomeIcon from "@mui/icons-material/Home";
import QuizIcon from "@mui/icons-material/Quiz";
import InsightsIcon from "@mui/icons-material/Insights";
import Diversity2Icon from "@mui/icons-material/Diversity2";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import PortraitIcon from "@mui/icons-material/Portrait";

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
    display: "contact",
    path: "/contact",
    state: "contact",
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
    path: '#',
    icon: <YouTubeIcon fontSize="large"/>,
    state: 'youtube',
  },
  {
    path: '#',
    icon: <FacebookIcon fontSize="large"/>,
    state: 'facebook',
  },
  {
    path: '#',
    icon: <InstagramIcon fontSize="large"/>,
    state: 'instagram',
  },
];

const user = [
  {
    display: "profile",
    path: "/dashboard/profile",
    icon: <PortraitIcon />,
    state: "profile"
  },
  {
    display: "reviews",
    path: "/reviews",
    icon: <RateReviewOutlinedIcon />,
    state: "reviews"
  },
  {
    display: "password update",
    path: "/password-update",
    icon: <LockResetOutlinedIcon />,
    state: "password.update"
  }
];

const menuConfigs = { main, footMenu, socialMedia, user};

export default menuConfigs;
