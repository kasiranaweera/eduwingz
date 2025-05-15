import { ThemeProvider } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import themeConfigs from "./configs/theme.config";
import { ToastContainer } from "react-toastify";
import CssBaseline from "@mui/material/CssBaseline";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import CommonLayout from "./components/layouts/CommonLayout"
import DashboardLayout from "./components/layouts/DashboardLayout";
import EmptyLayout from "./components/layouts/EmptyLayout";
import commonRoutes from "./routes/commonRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import PageWrapper from "./components/PageWrapper";
import specialRoutes from "./routes/specialRoutes";
import LoadingPage from "./pages/LoadingPage";

import "react-toastify/dist/ReactToastify.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { useEffect } from "react";
import { setUser } from "./redux/features/userSlice";

const App = () => {
  const { themeMode } = useSelector((state) => state.themeMode);

  const dispatch = useDispatch();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      dispatch(setUser(JSON.parse(savedUser)));
    }
  }, [dispatch]);

  return (
    <ThemeProvider theme={themeConfigs.custom({ mode: themeMode })}>
      {/* config toastify */}
      <ToastContainer
        position="bottom-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        pauseOnHover
        theme={themeMode}
      />
      {/* mui reset css */}
      <CssBaseline />

      {/* app routes */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoadingPage />} />
          <Route path="/" element={<CommonLayout />}>
            {commonRoutes.map((route, index) =>
              route.index ? (
                <Route
                  index
                  key={index}
                  element={
                    route.state ? (
                      <PageWrapper state={route.state}>
                        {route.element}
                      </PageWrapper>
                    ) : (
                      route.element
                    )
                  }
                />
              ) : (
                <Route
                  path={route.path}
                  key={index}
                  element={
                    route.state ? (
                      <PageWrapper state={route.state}>
                        {route.element}
                      </PageWrapper>
                    ) : (
                      route.element
                    )
                  }
                />
              )
            )}
          </Route>
          <Route path="/dashboard/" element={<DashboardLayout />}>
            {dashboardRoutes.map((route, index) =>
              route.index ? (
                <Route
                  index
                  key={index}
                  element={
                    route.state ? (
                      <PageWrapper state={route.state}>
                        {route.element}
                      </PageWrapper>
                    ) : (
                      route.element
                    )
                  }
                />
              ) : (
                <Route
                  path={route.path}
                  key={index}
                  element={
                    route.state ? (
                      <PageWrapper state={route.state}>
                        {route.element}
                      </PageWrapper>
                    ) : (
                      route.element
                    )
                  }
                />
              )
            )}
          </Route>
          <Route path="/main/" element={<EmptyLayout />}>
            {specialRoutes.map((route, index) =>
              route.index ? (
                <Route
                  index
                  key={index}
                  element={
                    route.state ? (
                      <PageWrapper state={route.state}>
                        {route.element}
                      </PageWrapper>
                    ) : (
                      route.element
                    )
                  }
                />
              ) : (
                <Route
                  path={route.path}
                  key={index}
                  element={
                    route.state ? (
                      <PageWrapper state={route.state}>
                        {route.element}
                      </PageWrapper>
                    ) : (
                      route.element
                    )
                  }
                />
              )
            )}
          </Route>
        </Routes>
      </BrowserRouter>
      {/* app routes */}
    </ThemeProvider>
  );
};

export default App;

