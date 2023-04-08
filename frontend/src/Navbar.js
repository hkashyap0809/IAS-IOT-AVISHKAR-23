import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Navbar.css";
function Navbar() {
  const userName = localStorage.getItem("userName");
  const navigate = useNavigate();
  console.log(userName);
  const handleLogout = () => {
    localStorage.clear("userName");
    localStorage.clear("token");
    navigate("/");
  };
  return (
    <header>
      <div className="wrapper">
        <div className="logo">
          <a href="signup">AVISHKAR</a>
        </div>
        <div className="navbar">
          <nav>
            <ul>
              <li className="current-user">
                {userName ? (
                  <a style={{ color: "black" }} href="#">
                    Hello {userName}
                  </a>
                ) : (
                  ""
                )}
              </li>
              <li>
                {userName ? (
                  <button
                    type="submit"
                    className="logout-btn"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                ) : (
                  ""
                )}
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
export default Navbar;
