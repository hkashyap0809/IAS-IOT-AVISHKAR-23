import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./appDev.css";
function AppDev() {
  const [showContent1, setShowContent1] = useState(false);
  const [showContent2, setShowContent2] = useState(false);

  const handleClick1 = () => {
    setShowContent1(!showContent1);
    setShowContent2(false);
  };

  const handleClick2 = () => {
    setShowContent2(!showContent2);
    setShowContent1(false);
  };
  return (
    <div className="appdev">
      <nav></nav>
      <h1 className="userType">Application Developer</h1>
      <div>
        <button onClick={handleClick1}>Upload App</button>
        <button onClick={handleClick2}>View Deployed Application</button>
        {showContent1 && (
          <div className="center">
            <label htmlFor="myfile">Upload app</label>
            <input type="file" id="myfile" name="myfile" />
            <br />
            <label>Rules to upload app file</label>
            <br />
            <a href="timetable.pdf" download>
              <b>Download</b>
            </a>
          </div>
        )}
        {showContent2 && (
          <div>
            <label>To check all deployed application</label>
            <br />
            <b>
              <a href="https://www.w3schools.com">Click here</a>
            </b>
            <br />
          </div>
        )}
      </div>
    </div>
  );
}
export default AppDev;
