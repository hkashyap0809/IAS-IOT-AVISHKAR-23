import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Navbar.css";
function Navbar() {
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
                <a style={{ color: "rgb(218, 193, 193)" }} href="#">
                  Hello, Good Morning
                </a>
              </li>
              <li>
                <button type="submit" className="logout-btn">
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
export default Navbar;
