import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import "../css/style.css";
import Cardview from "./Cardview";
import Leftbar2 from "./Leftbar2";
function Enduser() {
  const [tabIndex, setTabIndex] = useState(1);
  return (
    <div>
      <Navbar />
      <Leftbar2 />
    </div>
  );
}
export default Enduser;
