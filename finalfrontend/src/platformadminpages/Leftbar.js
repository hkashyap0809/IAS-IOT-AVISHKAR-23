import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/style.css";
function Leftbar() {
  const [tabIndex, setTabIndex] = useState(1);
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
                  <h6 className="nav-link px-2  fs-4">Platform Admin</h6>
                </li>
              </li>
              <li className="my-2">
                <hr className="dropdown-divider bg-light" />
              </li>
              <li>
                <a className="nav-link px-1">
                  <span className="me-1">
                    <i className="bi bi-check-circle-fill"></i>
                  </span>
                  <span
                    className={tabIndex === 1 ? "btns selctedbtn" : "btns"}
                    onClick={() => setTabIndex(1)}
                  >
                    Platform Status
                  </span>
                </a>
              </li>
              <li>
                <a className="nav-link px-1">
                  <span className="me-1">
                    <i className="bi bi-heart-fill"></i>
                  </span>
                  <span
                    className={tabIndex === 2 ? "btns selctedbtn" : "btns"}
                    onClick={() => setTabIndex(2)}
                  >
                    Module Status/Health
                  </span>
                </a>
              </li>

              <li>
                <a className="nav-link px-1">
                  <span className="me-1">
                    <i className="bi bi-eye"></i>
                  </span>
                  <span
                    className={tabIndex === 3 ? "btns selctedbtn" : "btns"}
                    onClick={() => setTabIndex(3)}
                  >
                    View All Uploaded Apps
                  </span>
                </a>
              </li>

              <li>
                <a className="nav-link px-1">
                  <span className="me-1">
                    <i className="bi bi-eye"></i>
                  </span>
                  <span
                    className={tabIndex === 4 ? "btns selctedbtn" : "btns"}
                    onClick={() => setTabIndex(4)}
                  >
                    View All Deployed Apps
                  </span>
                </a>
              </li>

              <li>
                <a className="nav-link px-1">
                  <span className="me-1">
                    <i className="bi bi-eye"></i>
                  </span>
                  <span
                    className={tabIndex === 5 ? "btns selctedbtn" : "btns"}
                    onClick={() => setTabIndex(5)}
                  >
                    View All Workflows
                  </span>
                </a>
              </li>

              <li>
                <a className="nav-link px-1">
                  <span className="me-1">
                    <i className="bi bi-eye"></i>
                  </span>
                  <span
                    className={tabIndex === 6 ? "btns selctedbtn" : "btns"}
                    onClick={() => setTabIndex(6)}
                  >
                    View All Scheduled Apps
                  </span>
                </a>
              </li>

              <li>
                <a className="nav-link px-1">
                  <span className="me-1">
                    <i className="bi bi-pencil-square"></i>
                  </span>
                  <span
                    className={tabIndex === 7 ? "btns selctedbtn" : "btns"}
                    onClick={() => setTabIndex(7)}
                  >
                    Logger/Logs
                  </span>
                </a>
              </li>

              <li>
                <a className="nav-link px-1">
                  <span className="me-1">
                    <i className="bi bi-lightning-charge"></i>
                  </span>
                  <span
                    className={tabIndex === 8 ? "btns selctedbtn" : "btns"}
                    onClick={() => setTabIndex(8)}
                  >
                    Sensor Live Data
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
            <main className="mt-5 pt-5 ">
              <div className="container-fluid ">
                <h4 className="nav-link px-2  fs-4">Platform Status</h4>
                <label className="switch">
                  <input type="checkbox" />
                  <span className="slider round"></span>
                </label>
              </div>
            </main>
          </div>
        )}
        {tabIndex === 2 && (
          <div>
            <main className="mt-5 pt-5 ">
              <div className="container-fluid ">
                <div className="card">
                  <div className="card-header">Module Health</div>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      Node Manager
                      <span className="badge bg-success rounded-pill">OK</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      Sensor Manager
                      <span className="badge bg-warning rounded-pill">
                        Degraded
                      </span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                      Application Manager
                      <span className="badge bg-danger rounded-pill">Down</span>
                    </li>
                  </ul>
                </div>
              </div>
            </main>
          </div>
        )}
        {tabIndex === 3 && <div></div>}
      </div>
    </div>
  );
}
export default Leftbar;
