import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "./App.css";
import Login from "./Components/Auth/Login";
import Home from "./Components/Home/Home";

function App() {
  const usersDetails = useSelector((state) => state.users);
  const isAuthenticated = usersDetails.isLogin;
  const isCompanyProfileDone = usersDetails.isCompanyProfileDone;
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (
      isAuthenticated &&
      isCompanyProfileDone &&
      usersDetails.selectedDashboard !== "" &&
      location.pathname == "/"
    ) {
      navigate(usersDetails.selectedDashboard);
    } else if (!isAuthenticated || !isCompanyProfileDone) {
      navigate("/");
    }
  }, [usersDetails.selectedDashboard]);

  return (
    <div className="h-screen  overflow-hidden">
      <Routes>
        {(!isAuthenticated || !isCompanyProfileDone) && (
          <Route path="/" element={<Login />}></Route>
        )}
        {isAuthenticated && usersDetails.selectedDashboard === "" && (
          <Route path="/*" element={<Home />}></Route>
        )}
      </Routes>
      <ToastContainer />
    </div>
  );
}

export default App;
