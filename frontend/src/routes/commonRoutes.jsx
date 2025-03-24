import HomePage from "../pages/HomePage";
import FeaturesPage from "../pages/FeaturesPage"
import DownloadPage from "../pages/DownloadPage"
import ResourcesPage from "../pages/ResourcesPage"
import ResearchPage from "../pages/ResearchPage"

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
];

export default commonRoutes;
