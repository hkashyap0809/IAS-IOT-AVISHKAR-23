import React, { useState, useEffect } from "react";
import "../css/style.css";
import Cardview from "../enduserpages/Cardview";
import axios from "axios";

import {
  axiosAppInstance,
  axiosModuleHealthInstance,
} from "../utils/axiosInstance";
import Loader from "../utils/Loader";
import VmHealth from "./vmHealth";

function Leftbar() {
  const [tabIndex, setTabIndex] = useState(1);
  const [platformStatus, switchPlatformStatus] = useState(false);
  const [uploadedApps, setUploadedApps] = useState([]);
  const [deployedApps, setDeployedApps] = useState([]);
  const [appToDeploy, setAppToDeploy] = useState("");
  const [modules, setModules] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [currentModule, setCurrentModule] = useState("");
  const [currentModuleLog, setCurrentModuleLog] = useState("");
  const [vmHealth, setVmHealth] = useState([]);
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
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    } else if (tabIndex === 4) {
      setDeployedApps([]);
      axiosAppInstance
        .get("/api/deployedApps/getDeployedApps/", config)
        .then((response) => {
          console.log(response);
          const { data } = response.data;
          setDeployedApps([...data]);
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    } else if (tabIndex === 5) {
      // Handle view workflows
    } else if (tabIndex === 6) {
      // Handle View All Scheduled Apps
    } else if (tabIndex === 7) {
      // Handle VM Health
      setLoading(true);
      const url = "http://20.21.102.175:8050/getAppsDetails";
      axios
        .get(url)
        .then((response) => {
          console.log(response);
          const nodeManager = response.data.filter(
            (r, idx) => r.appName === "NodeManager"
          );
          console.log(nodeManager);
          const endPoint = nodeManager[0].endpoint;

          axios
            .get(`${endPoint}/nodemgr/get-all-nodes-health`)
            .then((resp) => {
              setLoading(false);
              setVmHealth([...resp.data]);
              console.log(resp);
            })
            .catch((err) => {
              setLoading(false);
              console.log(err);
            });
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    } else if (tabIndex === 8) {
      // Handle Live Sensor Data
    } else if (tabIndex === 9) {
      // Handle
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

  const fetchLogs = (e, moduleName, ip, port) => {
    e.preventDefault();
    setCurrentModule(moduleName);
    console.log("Function Called");
    setLoading(true);
    const url = `http://${ip}:${port}/get_logs`;
    axios
      .get(url)
      .then((response) => {
        console.log(response);
        const { logs } = response.data;
        setCurrentModuleLog(logs);
        setLoading(false);
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
        <div key={idx} onClick={(e) => fetchLogs(e, moduleName, ip, port)}>
          <li
            className="list-group-item d-flex justify-content-between align-items-center"
            style={{ cursor: "pointer", fontWeight: "bold" }}
          >
            <tr className={moduleName === currentModule ? "active" : ""}>
              <td>
                {moduleName} - {ip}:{port} - Last Updated At: {timestamp}
              </td>
            </tr>
            {status === "Ok" ? (
              <span className="badge bg-success rounded-pill">OK</span>
            ) : (
              <span className="badge bg-danger rounded-pill">Down</span>
            )}
            {currentModule === moduleName && <p>{currentModuleLog}</p>}
          </li>
        </div>
      );
    })
  ) : (
    <div>...Fetching status</div>
  );

  const vmHealthData = vmHealth.map((v, idx) => {
    return <VmHealth data={v} />;
  });

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
                    <i className="bi bi-heart-fill"></i>
                  </span>
                  <span
                    className={tabIndex === 7 ? "btns selctedbtn" : "btns"}
                    onClick={() => setTabIndex(7)}
                    style={{ cursor: "pointer" }}
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
                    style={{ cursor: "pointer" }}
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
                    style={{ cursor: "pointer" }}
                  >
                    We@Avishkar
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
                    <div className="card-header">Module Status/Logs</div>
                    <ul className="list-group list-group-flush">
                      {modulesData}
                    </ul>
                  </div>
                </Loader>
              </div>
            </main>
          </div>
        )}
        {tabIndex === 3 && (
          <main className="mt-5 pt-1">
            <div className="container-fluid">
              <div className="row mt-5">
                <Loader spinning={isLoading}>
                  <div className="card-container">
                    {uploadedApps.length ? (
                      uploadedAppsData
                    ) : (
                      <h2>Fetching uploaded apps</h2>
                    )}
                  </div>
                </Loader>
              </div>
            </div>
          </main>
        )}
        {tabIndex === 4 && (
          <main className="mt-5 pt-1">
            <div className="container-fluid">
              <div className="row mt-5">
                <Loader spinning={isLoading}>
                  <div className="card-container">
                    {deployedApps.length ? (
                      deployedAppsData
                    ) : (
                      <h2>Fetching deployed apps</h2>
                    )}
                  </div>
                </Loader>
              </div>
            </div>
          </main>
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
                    <Loader spinning={isLoading}>
                      <div className="card-container">
                        {vmHealth.length ? (
                          vmHealthData
                        ) : (
                          <h2>Fetching VM's health</h2>
                        )}
                      </div>
                    </Loader>
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
