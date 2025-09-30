import { lazy, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import ArticlePage from "./Components/test2";

// 🔹 Lazy load components
const Login = lazy(() => import("./Components/Auth/Login"));
const Home = lazy(() => import("./Components/Home/Home"));

function App() {
  const usersDetails = useSelector((state: any) => state?.users);
  const isAuthenticated = usersDetails.isLogin;
  const isCompanyProfileDone = usersDetails.isCompanyProfileDone;
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (
      isAuthenticated &&
      isCompanyProfileDone &&
      usersDetails.selectedDashboard !== "" &&
      location.pathname === "/"
    ) {
      navigate(usersDetails.selectedDashboard);
    } else if (!isAuthenticated || !isCompanyProfileDone) {
      navigate("/");
    }
  }, [
    isAuthenticated,
    isCompanyProfileDone,
    usersDetails.selectedDashboard,
    location.pathname,
    navigate,
  ]);

  return (
    <div className="h-screen ">
      {/* 🔹 Suspense fallback loader */}
      {/* <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            Loading...
          </div>
        }
      >
        <Routes>
          {(!isAuthenticated || !isCompanyProfileDone) && (
            <Route path="/" element={<Login />} />
          )}
          {isAuthenticated && usersDetails.selectedDashboard === "" && (
            <Route path="/*" element={<Home />} />
          )}
        </Routes>
      </Suspense>
      <ToastContainer /> */}
      <ArticlePage />
    </div>
  );
}

export default App;
