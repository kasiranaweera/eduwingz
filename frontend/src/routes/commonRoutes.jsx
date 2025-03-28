import HomePage from "../pages/HomePage";
import FeaturesPage from "../pages/FeaturesPage"
import DownloadPage from "../pages/DownloadPage"
import ResourcesPage from "../pages/ResourcesPage"
import ResearchPage from "../pages/ResearchPage"
import AboutPage from "../pages/AboutPage"
import TechnologyPage from "../pages/TechnologyPage"
import TeamPage from "../pages/TeamPage"
import PrivacyPage from "../pages/PrivacyPage"

export const routesGen = {
  home: "/",
};

const commonRoutes = [
//   {
//     index: true,
//     element: <StartPage />,
//     state: "start",
//   },
  {
    path: "/home",
    element: <HomePage />,
    state: "home",
  },
  {
    path: "/features",
    element: <FeaturesPage />,
    state: "features",
  },
  {
    path: "/download",
    element: <DownloadPage />,
    state: "download",
  },
  {
    path: "/resources",
    element: <ResourcesPage />,
    state: "resources",
  },
  {
    path: "/research",
    element: <ResearchPage />,
    state: "research",
  },
  {
    path: "/about",
    element: <AboutPage />,
    state: "about",
  },
  {
    path: "/team",
    element: <TeamPage />,
    state: "team",
  },
  {
    path: "/technology",
    element: <TechnologyPage />,
    state: "technology",
  },
  {
    path: "/privacy",
    element: <PrivacyPage />,
    state: "privacy",
  },
];

export default commonRoutes;
