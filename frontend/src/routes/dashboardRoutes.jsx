import ChatPage from "../pages/ChatPage";
import ProtectedPage from "../components/ProtectedPage";
import DashboardPlatformPage from "../pages/PlatformPage";
import DashboardProfilePage from "../pages/DashboardProfilePage";
import DashboardDocumentPage from "../pages/DashboardDocumentPage";
import ChatHistoryPage from "../pages/ChatHistoryPage";
import ChatBookmarkPage from "../pages/ChatBookmarkPage";
import ChatNewPage from "../pages/ChatNewPage";
import DashboardMainPage from "../pages/DashboardMainPage";
import DashboardUpdatesPage from "../pages/DashboardUpdatesPage";
import DashboardSettingsPage from "../pages/DashboardSettingsPage";
import PlatformNotes from "../pages/PlatformNotes";
import PlatformCommunity from "../pages/PlatformCommunity";
import DashboardQuizzesPage from "../pages/DashboardQuizzesPage";
import DashboardAnaliticsPage from "../pages/DashboardAnalyticsPage"
import DashboardMinehoarizonPage from "../pages/DashboardMinehorizonPage"
import PlatformLessons from "../pages/PlatformLessons";

export const routesGen = {
  dashboard: "/",
};

const dashboardRoutes = [
  {
    index: true,
    element: (
      <ProtectedPage>
        <DashboardMainPage />
      </ProtectedPage>
    ),
    state: "main",
  },
  {
    path: "/dashboard/chat/new",
    element: (
      <ProtectedPage>
        <ChatNewPage />
      </ProtectedPage>
    ),
    state: "newchat",
  },
  {
    path: "/dashboard/chat",
    element: (
      <ProtectedPage>
        <ChatPage />
      </ProtectedPage>
    ),
    state: "educhat",
  },
  {
    path: "/dashboard/chat/:sessionId",
    element: (
      <ProtectedPage>
        <ChatPage />
      </ProtectedPage>
    ),
    state: "educhat-session",
  },
  {
    path: "/dashboard/platform",
    element: (
      <ProtectedPage>
        <DashboardPlatformPage />
      </ProtectedPage>
    ),
    state: "eduplatform",
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
    path: "/dashboard/updates",
    element: (
      <ProtectedPage>
        <DashboardUpdatesPage />
      </ProtectedPage>
    ),
    state: "progress",
  },
  {
    path: "/dashboard/settings",
    element: (
      <ProtectedPage>
        <DashboardSettingsPage />
      </ProtectedPage>
    ),
    state: "settings",
  },
  {
    path: "/dashboard/chat/history",
    element: (
      <ProtectedPage>
      <ChatHistoryPage />
      </ProtectedPage>
    ),
    state: "chat-history",
  },
  {
    path: "/dashboard/chat/bookmarks",
    element: (
      <ProtectedPage>
      <ChatBookmarkPage />
      </ProtectedPage>
    ),
    state: "chat-bookmarks",
  },
  {
    path: "/dashboard/platform/notes",
    element: (
      <ProtectedPage>
      <PlatformNotes />
      </ProtectedPage>
    ),
    state: "platform-notes",
  },
  {
    path: "/dashboard/platform/community",
    element: (
      <ProtectedPage>
      <PlatformCommunity />
      </ProtectedPage>
    ),
    state: "platform-community",
  },
  {
    path: "/dashboard/quizzes",
    element: (
      <ProtectedPage>
      <DashboardQuizzesPage />
      </ProtectedPage>
    ),
    state: "quizzes",
  },
  {
    path: "/dashboard/analytics",
    element: (
      <ProtectedPage>
      <DashboardAnaliticsPage />
      </ProtectedPage>
    ),
    state: "analitics",
  },
  {
    path: "/dashboard/mine-horizon",
    element: (
      <ProtectedPage>
      <DashboardMinehoarizonPage />
      </ProtectedPage>
    ),
    state: "platform-community",
  },
  {
    path: "/dashboard/platform/lessons",
    element: (
      <ProtectedPage>
      <PlatformLessons />
      </ProtectedPage>
    ),
    state: "platform-lessons",
  },
];

export default dashboardRoutes;
