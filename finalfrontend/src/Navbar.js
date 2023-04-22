import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./css/bootstrap.min.css";
function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
      <div className="container-fluid">
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#sidebar"
          aria-controls="offcanvasExample"
        >
          <span
            className="navbar-toggler-icon"
            data-bs-target="#sidebar"
          ></span>
        </button>
        <a
          className="navbar-brand me-auto ms-lg-0 ms-3 text-uppercase fw-bold"
          href="#"
        >
          AVISHKAR
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#topNavBar"
          aria-controls="topNavBar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="topNavBar">
          <div className="d-flex ms-auto my-lg-0">
            <h1
              style={{
                color: "white",
                fontSize: "25px",
                marginTop: "7px",
                marginRight: "10px",
              }}
            >
              Current User
            </h1>
          </div>
        </div>
        <button type="button" class="btn btn-danger btn-sm">
          Logout
        </button>
      </div>
    </nav>
  );
}
export default Navbar;
