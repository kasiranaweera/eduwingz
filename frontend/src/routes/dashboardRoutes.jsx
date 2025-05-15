import DashboardChatPage from "../pages/ChatPage";
import ProtectedPage from "../components/ProtectedPage";
import DashboardPlatformPage from "../pages/DashboardPlatformPage";
import DashboardProfilePage from "../pages/DashboardProfilePage";
import DashboardDocumentPage from "../pages/DashboardDocumentPage";
import ChatHistoryPage from "../pages/ChatHistoryPage";
import ChatBookmarkPage from "../pages/ChatBookmarkPage";
import DashboardChatNewPage from "../pages/ChatNewPage";
import DashboardMainPage from "../pages/DashboardMainPage";

export const routesGen = {
  dashboard: "/",
};

const dashboardRoutes = [
  {
    index: true,
    element: (
        <ProtectedPage>
            <DashboardMainPage/>
        </ProtectedPage>
    ),
    state: "main"
},
  {
      path:'/dashboard/new-chat',
      element: (
          // <ProtectedPage>
              <DashboardChatNewPage/>
          // </ProtectedPage>
      ),
      state: "newchat"
  },
  {
    path: "/dashboard/chat",
    element: (
      // <ProtectedPage>
        <DashboardChatPage />
      // </ProtectedPage>
    ),
    state: "educhat",
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
      //<ProtectedPage>
        <ChatHistoryPage />
      //</ProtectedPage>
    ),
    state: "chathitory",
  },
  {
    path: "/dashboard/chat-bookmarks",
    element: (
      // <ProtectedPage>
        <ChatBookmarkPage />
      // </ProtectedPage>
    ),
    state: "chatbookmarks",
  },
];

export default dashboardRoutes;
