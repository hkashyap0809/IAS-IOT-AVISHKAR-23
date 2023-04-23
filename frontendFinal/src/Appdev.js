import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./css/style.css";
import Leftbar from "./applicationdevpages/Leftbar";
function Appdev() {
  const [isLoggedIn, setLoggedIn] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      setLoggedIn(false);
      navigate("/");
    } else if (localStorage.getItem("role") === "admin") {
      navigate("/platformadmin");
    } else if (localStorage.getItem("role") === "user") {
      navigate("/enduser");
    }
  }, [isLoggedIn]);
  return (
    <div>
      <Navbar />
      <Leftbar />
    </div>
  );
}
export default Appdev;
