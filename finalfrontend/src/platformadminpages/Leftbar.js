import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/style.css";
import Logger from "./Logger";
import Vmhealth from "./Vmhealth";
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
                    Module Status/Logs
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
                    <i className="bi bi-heart-fill"></i>
                  </span>
                  <span
                    className={tabIndex === 7 ? "btns selctedbtn" : "btns"}
                    onClick={() => setTabIndex(7)}
                  >
                    VM's Health Info
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

              <li>
                <a className="nav-link px-1">
                  <span className="me-1">
                    <i className="bi bi-info-circle"></i>
                  </span>
                  <span
                    className={tabIndex === 9 ? "btns selctedbtn" : "btns"}
                    onClick={() => setTabIndex(9)}
                  >
                    About Us
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
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm "
                    style={{ position: "fixed", top: "10%", right: "1%" }}
                  >
                    Refresh
                  </button>
                  <div className="card-header">Module Status/Logs</div>
                  <ul className="list-group list-group-flush">
                    <Logger />
                    <Logger />
                  </ul>
                </div>
              </div>
            </main>
          </div>
        )}
        {tabIndex === 7 && (
          <div>
            <button
              type="button"
              className="btn btn-secondary btn-sm "
              style={{ position: "absolute", top: "10%", right: "1%" }}
            >
              Refresh
            </button>
            <br />
            <br />
            <div>
              <main className="mt-5 pt-1">
                <div className="container-fluid">
                  <div className="row">
                    <div className="card-container">
                      <Vmhealth />
                      <Vmhealth />
                      <Vmhealth />
                    </div>
                  </div>
                </div>
              </main>
              <style jsx>{`
                .card-container {
                  display: flex;
                  justify-content: space-between;
                  margin: 10 -10px;
                }
                .card-container > * {
                  margin: 0 10px;
                }
              `}</style>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default Leftbar;
