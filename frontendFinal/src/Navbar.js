import React from "react";
import { useNavigate } from "react-router-dom";
import "./css/bootstrap.min.css";
function Navbar() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");
  const handleLogout = () => {
    localStorage.clear("token");
    localStorage.clear("userName");
    localStorage.clear("role");
    navigate("/");
  };
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
              {`Hello ${userName}`}
            </h1>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-danger btn-sm"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
export default Navbar;
