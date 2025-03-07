import DashboardPage from "../pages/DashboardPage";

export const routesGen = {
    dashboard: "/",
}

const dashboardRoutes = [
    {
        index: true,
        element: <DashboardPage/>,
        state: "dashboard"
    },
];

export default dashboardRoutes;