import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import AccessibilityIcon from '@mui/icons-material/Accessibility';
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import YouTubeIcon from '@mui/icons-material/YouTube';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import HomeIcon from '@mui/icons-material/Home';
import QuizIcon from '@mui/icons-material/Quiz';
import InsightsIcon from '@mui/icons-material/Insights';
import Diversity2Icon from '@mui/icons-material/Diversity2';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import PortraitIcon from '@mui/icons-material/Portrait';

const main = [
  {
    display: "home",
    path: "/",
    icon: <HomeOutlinedIcon />,
    state: "home"
  },
  {
    display: "features",
    path: "/features",
    icon: <AddIcon />,
    state: "feature"
  },
  {
    display: "download",
    path: "/download",
    icon: <DownloadIcon />,
    state: "download"
  },
  {
    display: "resources",
    path: "/resources",
    icon: <AccessibilityIcon />,
    state: "resources"

  }
];


const menuConfigs = { main };

export default menuConfigs;