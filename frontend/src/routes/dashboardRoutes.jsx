import DashboardChatPage from "../pages/DashboardChatPage";
import ProtectedPage from "../components/ProtectedPage";
import DashboardPlatformPage from "../pages/DashboardPlatformPage";
import DashboardProfilePage from "../pages/DashboardProfilePage";
import DashboardDocumentPage from "../pages/DashboardDocumentPage";
import ChatHistoryPage from "../pages/ChatHistoryPage";
import ChatBookmarkPage from "../pages/ChatBookmarkPage";

export const routesGen = {
  dashboard: "/",
};

const dashboardRoutes = [
  // {
  //     index: true,
  //     element: (
  //         <ProtectedPage>
  //             <DashboardChat/>
  //         </ProtectedPage>
  //     ),
  //     state: "dashboard"
  // },
  {
    path: "/dashboard/chat",
    element: (
      <ProtectedPage>
        <DashboardChatPage />
      </ProtectedPage>
    ),
    state: "chat",
  },
  {
    path: "/dashboard/platform",
    element: (
      <ProtectedPage>
        <DashboardPlatformPage />
      </ProtectedPage>
    ),
    state: "platform",
  },
  {
    path: "/dashboard/profile",
    element: (
      <ProtectedPage>
        <DashboardProfilePage />
      </ProtectedPage>
    ),
    state: "profile",
  },
  {
    path: "/dashboard/documents",
    element: (
      <ProtectedPage>
        <DashboardDocumentPage />
      </ProtectedPage>
    ),
    state: "documents",
  },
  {
    path: "/dashboard/progress",
    element: (
      <ProtectedPage>
        <DashboardChatPage />
      </ProtectedPage>
    ),
    state: "progress",
  },
  {
    path: "/dashboard/chat-hitory",
    element: (
      <ProtectedPage>
        <ChatHistoryPage />
      </ProtectedPage>
    ),
    state: "chathitory",
  },
  {
    path: "/dashboard/chat-bookmarks",
    element: (
      <ProtectedPage>
        <ChatBookmarkPage />
      </ProtectedPage>
    ),
    state: "chat-bookmarks",
  },
];

export default dashboardRoutes;
