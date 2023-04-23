import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/style.css";
import Cardview from "../enduserpages/Cardview";
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
                  <h6 className="nav-link px-2 fs-4 ">End User</h6>
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
                    View Upload Apps
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

              <li>
                <a className="nav-link px-1">
                  <span className="me-1">
                    <i className="bi bi-info-circle"></i>
                  </span>
                  <span
                    className={tabIndex === 4 ? "btns selctedbtn" : "btns"}
                    onClick={() => setTabIndex(4)}
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
        {tabIndex === 4 && (
          <div>
            <main className="mt-5 pt-3">
              <div className="container-fluid">
                <div className="row">
                  <div className="container">
                    <div className="row">
                      <div className="col-md-4">
                        <div className="card">
                          <div className="card-body">
                            <h5 className="card-title">
                              Ujjwal Prakash (2022202009)
                            </h5>
                            <p className="card-text">
                              Mtech-CSIS IIIT Hyderabad 2022-2024
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="card">
                          <div className="card-body">
                            <h5 className="card-title">
                              Harshit Kashyap (2022202009)
                            </h5>
                            <p className="card-text">
                              Mtech-CSE IIIT Hyderabad 2022-2024
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="card">
                          <div className="card-body">
                            <h5 className="card-title">
                              Yash Pathak (2022202009)
                            </h5>
                            <p className="card-text">
                              Mtech-CS IIIT Hyderabad 2022-2024
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="card">
                          <div className="card-body">
                            <h5 className="card-title">
                              Prashant Kumar (2022201058)
                            </h5>
                            <p className="card-text">
                              Mtech-CS IIIT Hyderabad 2022-2024
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="card">
                          <div className="card-body">
                            <h5 className="card-title">
                              Rishabh Gupta (2022202011)
                            </h5>
                            <p className="card-text">
                              Mtech-CSIS IIIT Hyderabad 2022-2024
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="card">
                          <div className="card-body">
                            <h5 className="card-title">
                              Priyank Mahour (2022201047)
                            </h5>
                            <p className="card-text">
                              Mtech-CS IIIT Hyderabad 2022-2024
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
export default Leftbar;
