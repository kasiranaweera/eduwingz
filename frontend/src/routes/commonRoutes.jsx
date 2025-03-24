import HomePage from "../pages/HomePage";

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
];

export default commonRoutes;
