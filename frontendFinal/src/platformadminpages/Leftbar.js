import React, { useState, useEffect } from "react";
import "../css/style.css";
import Cardview from "../enduserpages/Cardview";

import {
  axiosAppInstance,
  axiosModuleHealthInstance,
} from "../utils/axiosInstance";
import Loader from "../utils/Loader";

function Leftbar() {
  const [tabIndex, setTabIndex] = useState(1);
  const [platformStatus, switchPlatformStatus] = useState(false);
  const [uploadedApps, setUploadedApps] = useState([]);
  const [deployedApps, setDeployedApps] = useState([]);
  const [appToDeploy, setAppToDeploy] = useState("");
  const [modules, setModules] = useState([]);
  const [isLoading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    };
    if (tabIndex === 1) {
      // Handle Platform Status
    } else if (tabIndex === 2) {
      // Handle Module Status / Logs
      getLatestModuleStatus();
    } else if (tabIndex === 3) {
      // View all the uploaded apps
      setUploadedApps([]);
      axiosAppInstance
        .get("/api/baseApp/getapps/", config)
        .then((response) => {
          console.log(response);
          const { data } = response.data;
          setUploadedApps([...data]);
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (tabIndex === 4) {
      setDeployedApps([]);
      axiosAppInstance
        .get("/api/deployedApps/getDeployedApps/", config)
        .then((response) => {
          console.log(response);
          const { data } = response.data;
          setDeployedApps([...data]);
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (tabIndex === 5) {
      // Handle view workflows
    } else if (tabIndex === 6) {
      // Handle View All Scheduled Apps
    } else if (tabIndex === 7) {
      // Handle Logs
    } else if (tabIndex === 8) {
      // Handle Live Sensor Data
    }
    setLoading(false);
  }, [tabIndex]);

  const switchToLocationInput = (
    e,
    isUploadCard,
    appId,
    appName,
    developer,
    url
  ) => {
    if (isUploadCard) {
      setTabIndex(0);
      setAppToDeploy({
        baseAppId: appId,
        baseAppName: appName,
        developer: developer,
      });
    } else if (tabIndex === 4) {
      window.open(url, "_blank");
    }
  };

  const getLatestModuleStatus = () => {
    // e.preventDefault();
    console.log("Function called");
    setLoading(true);
    axiosModuleHealthInstance
      .get("/check_health")
      .then((response) => {
        setLoading(false);
        const { data } = response;
        setModules([...data]);
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
      });
  };

  const uploadedAppsData = uploadedApps.length ? (
    uploadedApps.map((app, idx) => (
      <Cardview
        key={idx}
        appName={app.appName}
        switchToLocationInput={(e) =>
          switchToLocationInput(
            e,
            false,
            app.id,
            app.appName,
            app.developer,
            ""
          )
        }
      />
    ))
  ) : (
    <div>No apps uploaded!</div>
  );
  const deployedAppsData = deployedApps.length ? (
    deployedApps.map((app, idx) => (
      <Cardview
        key={idx}
        appName={app.deployedAppName}
        switchToLocationInput={(e) =>
          switchToLocationInput(
            e,
            false,
            app.baseAppId,
            app.deployedAppName,
            app.developer,
            app.url
          )
        }
      />
    ))
  ) : (
    <p>No deployed apps!</p>
  );

  const modulesData = modules.length ? (
    modules.map((m, idx) => {
      const moduleName = m.service,
        ip = m.ip,
        port = m.port,
        status = m.status,
        timestamp = m.timestamp;
      return (
        <li
          key={idx}
          className="list-group-item d-flex justify-content-between align-items-center"
          style={{ cursor: "pointer", fontWeight: "bold" }}
        >
          {moduleName} - {ip}:{port} - Last Updated At: {timestamp}
          {status === "Ok" ? (
            <span className="badge bg-success rounded-pill">OK</span>
          ) : (
            <span className="badge bg-danger rounded-pill">Down</span>
          )}
        </li>
      );
    })
  ) : (
    <div>...Fetching status</div>
  );

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
                    style={{ cursor: "pointer" }}
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
                    style={{ cursor: "pointer" }}
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
                    style={{ cursor: "pointer" }}
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
                    style={{ cursor: "pointer" }}
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
                    style={{ cursor: "pointer" }}
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
                    style={{ cursor: "pointer" }}
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
                    style={{ cursor: "pointer" }}
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
                    style={{ cursor: "pointer" }}
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
                <Loader spinning={tabIndex === 2 && isLoading}>
                  <div className="card">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ position: "fixed", top: "7.5%", right: "1%" }}
                      onClick={getLatestModuleStatus}
                    >
                      Refresh
                    </button>
                    <div className="card-header">Module Health</div>
                    <ul className="list-group list-group-flush">
                      {modulesData}
                    </ul>
                  </div>
                </Loader>
              </div>
            </main>
          </div>
        )}
        {tabIndex === 3 && <div>{uploadedAppsData}</div>}
        {tabIndex === 4 && <div>{deployedAppsData}</div>}
      </div>
    </div>
  );
}
export default Leftbar;
