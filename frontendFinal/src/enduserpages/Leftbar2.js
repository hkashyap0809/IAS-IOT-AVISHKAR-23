import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/style.css";
import Cardview from "../enduserpages/Cardview";
import "./userinput.css";
function Leftbar2() {
  const [tabIndex, setTabIndex] = useState(0);
  const [isDateTimeEnabled, setIsDateTimeEnabled] = useState(false);
  function toggleDateTime() {
    setIsDateTimeEnabled(!isDateTimeEnabled);
  }
  return (
    <div>
      <div
        className="offcanvas offcanvas-start sidebar-nav bg-dark"
        tabIndex="-1"
        id="sidebar"
      >
        <div className="offcanvas-body p-0">
          <nav className="navbar-dark">
            <ul className="navbar-nav">
              <li>
                <li>
                  <h6 className="nav-link px-2 fs-4">End User</h6>
                </li>
              </li>
              <li className="my-2">
                <hr className="dropdown-divider bg-light" />
              </li>
              <li>
                <a className="nav-link px-1">
                  <span className="me-1">
                    <i className="bi bi-eye"></i>
                  </span>
                  <span
                    className={tabIndex === 1 ? "btns selctedbtn" : "btns"}
                    onClick={() => setTabIndex(1)}
                  >
                    View upload apps
                  </span>
                </a>
              </li>
              <li>
                <a className="nav-link px-1">
                  <span className="me-1">
                    <i className="bi bi-eye"></i>
                  </span>
                  <span
                    className={tabIndex === 2 ? "btns selctedbtn" : "btns"}
                    onClick={() => setTabIndex(2)}
                  >
                    View Deployed Apps
                  </span>
                </a>
              </li>

              <li>
                <a className="nav-link px-1">
                  <span className="me-1">
                    <i className="bi bi-calendar-event"></i>
                  </span>
                  <span
                    className={tabIndex === 3 ? "btns selctedbtn" : "btns"}
                    onClick={() => setTabIndex(3)}
                  >
                    Scheduling/Deployment
                  </span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div>
        {tabIndex === 1 && (
          <div>
            {" "}
            <Cardview />
          </div>
        )}
        {tabIndex === 2 && (
          <div>
            {" "}
            <Cardview />
            <Cardview />
          </div>
        )}
        {tabIndex === 3 && (
          <div>
            <Cardview />
            <Cardview />
            <Cardview />
          </div>
        )}
        {tabIndex === 0 && (
          <div>
            {" "}
            <main className="mt-5 pt-3">
              <div className="container-fluid">
                <div className="main">
                  <div className="location">
                    <h2>Locations</h2>
                    <select
                      className="form-select form-select-lg mb-3"
                      aria-label=".form-select-lg example location-selected"
                    >
                      <option value="1">OBH</option>
                      <option value="2">Vindhya</option>
                      <option value="3">KRB</option>
                    </select>
                    <br />
                  </div>

                  <button
                    onClick={toggleDateTime}
                    type="button"
                    className="btn btn-info"
                  >
                    Schedule
                  </button>
                  <br />
                  <br />
                  <div
                    className="datetime"
                    disabled={!isDateTimeEnabled}
                    style={{ display: isDateTimeEnabled ? "block" : "none" }}
                  >
                    <label htmlFor="starttime">Start (date and time):</label>
                    <input
                      type="datetime-local"
                      id="starttime"
                      name="starttime"
                    />
                    <br />
                    <br />
                    <label htmlFor="endtime">End (date and time):</label>
                    <input type="datetime-local" id="endtime" name="endtime" />
                    <br />
                    <br />
                  </div>
                  <button type="button" className="btn btn-success">
                    Run App
                  </button>
                </div>
              </div>
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
export default Leftbar2;
