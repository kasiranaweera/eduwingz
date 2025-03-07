import AuthPage from "../pages/AuthPage";

export const routesGen = {
    auth: "/",
}

const specialRoutes = [
    {
        index: true,
        element: <AuthPage/>,
        state: "authpage"
    },
];

export default specialRoutes;