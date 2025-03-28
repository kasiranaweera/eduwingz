import DashboardPage from "../pages/DashboardPage";
import ProtectedPage from "../components/ProtectedPage"

export const routesGen = {
    dashboard: "/",
}

const dashboardRoutes = [
    {
        index: true,
        element: (
            <ProtectedPage>
                <DashboardPage/>,
            </ProtectedPage>
        ),
        state: "dashboard"
    },
];

export default dashboardRoutes;