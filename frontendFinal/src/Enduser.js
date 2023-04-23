import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./css/style.css";
import Leftbar from "./enduserpages/Leftbar";
function Enduser() {
  const [isLoggedIn, setLoggedIn] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      setLoggedIn(false);
      navigate("/");
    } else if (localStorage.getItem("role") === "admin") {
      navigate("/platformadmin");
    } else if (localStorage.getItem("role") === "dev") {
      navigate("/appdev");
    }
  }, [isLoggedIn]);
  return (
    <div>
      <Navbar />
      <Leftbar />
    </div>
  );
}
export default Enduser;
