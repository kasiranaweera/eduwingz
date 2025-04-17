import ProtectedPage from "../components/ProtectedPage";
import MainBoardPage from "../pages/MainBoardPage";

export const routesGen = {
    mainboard: "/",
}

const specialRoutes = [
    {
        index: true,
        element: (
            <ProtectedPage>
                <MainBoardPage/>
            </ProtectedPage>
        ),
        state: "mainboard"
    },
];

export default specialRoutes;