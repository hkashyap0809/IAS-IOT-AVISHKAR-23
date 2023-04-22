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
                  <h6 className="nav-link px-2  fs-4">App Developer</h6>
                </li>
              </li>
              <li className="my-2">
                <hr className="dropdown-divider bg-light" />
              </li>
              <li>
                <a className="nav-link px-1">
                  <span className="me-1">
                    <i className="bi bi-upload"></i>
                  </span>
                  <span
                    className={tabIndex === 1 ? "btns selctedbtn" : "btns"}
                    onClick={() => setTabIndex(1)}
                  >
                    Upload App
                  </span>
                </a>
              </li>
              <li>
                <a className="nav-link px-1">
                  <span className="me-1">
                    <i className="bi bi-upload"></i>
                  </span>
                  <span
                    className={tabIndex === 2 ? "btns selctedbtn" : "btns"}
                    onClick={() => setTabIndex(2)}
                  >
                    Upload Workflow
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
                    View Uploaded Apps
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
                    View Deployed Apps
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
                    View Workflows
                  </span>
                </a>
              </li>

              <li>
                <a className="nav-link px-1">
                  <span className="me-1">
                    <i className="bi bi-book"></i>
                  </span>
                  <span
                    className={tabIndex === 6 ? "btns selctedbtn" : "btns"}
                    onClick={() => setTabIndex(6)}
                  >
                    Documentation
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
            <main className="mt-5 pt-3">
              <div className="container-fluid">
                <div className="main">
                  <div className="center">
                    <h1>Upload Application</h1>
                    <hr />
                    <label class="form-label" for="customFile">
                      In .zip format
                    </label>
                    <input type="file" class="form-control" id="customFile" />
                    <br />
                    <button type="button" class="btn btn-secondary">
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        )}
        {tabIndex === 2 && (
          <div>
            <main className="mt-5 pt-3">
              <div className="container-fluid">
                <div className="main">
                  <div className="center">
                    <h1>Upload Workflow</h1>
                    <hr />
                    <label class="form-label" for="customFile">
                      In .json format
                    </label>
                    <input type="file" class="form-control" id="customFile" />
                    <br />
                    <button type="button" class="btn btn-secondary">
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        )}
        {tabIndex === 3 && (
          <div>
            {/* <Cardview />
            <Cardview />
            <Cardview /> */}
          </div>
        )}
      </div>
    </div>
  );
}
export default Leftbar;
