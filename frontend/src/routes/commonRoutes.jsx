import HomePage from "../pages/HomePage";

export const routesGen = {
    home: "/",
};

const commonRoutes = [
    {
        index: true,
        element: <HomePage/>,
        state: "home"
    },
];

export default commonRoutes;