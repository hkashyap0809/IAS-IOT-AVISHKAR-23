import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./css/style.css";
import Leftbar from "./platformadminpages/Leftbar";
function Appdev() {
  const [tabIndex, setTabIndex] = useState(1);
  return (
    <div>
      <Navbar />
      <Leftbar />
    </div>
  );
}
export default Appdev;
