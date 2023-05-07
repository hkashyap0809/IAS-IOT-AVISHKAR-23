import React, { useState, useEffect } from "react";
import "../css/style.css";
import Cardview from "../enduserpages/Cardview";
import axios from "axios";

import {
  axiosAppInstance,
  axiosLocationInstance,
  axiosModuleHealthInstance,
} from "../utils/axiosInstance";
import Loader from "../utils/Loader";
import VmHealth from "./vmHealth";
import AboutUs from "../AboutUs";
import LoadBalancerCard from "./LoadBalancerCard";

function Leftbar() {
  const [tabIndex, setTabIndex] = useState(1);
  const [platformStatus, setPlatformStatus] = useState("");
  const [uploadedApps, setUploadedApps] = useState([]);
  const [deployedApps, setDeployedApps] = useState([]);
  const [scheduledApps, setScheduledApps] = useState([]);
  const [deploymentInProgressApps, setDeploymentInProgressApps] = useState([]);
  const [appToDeploy, setAppToDeploy] = useState("");
  const [modules, setModules] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [currentModule, setCurrentModule] = useState("");
  const [currentModuleLog, setCurrentModuleLog] = useState([]);
  const [vmHealth, setVmHealth] = useState([]);
  const [loadBalancerStats, setLoadBalancerStats] = useState([]);
  const [loadBalancerServices, setLoadBalancerServices] = useState([]);
  const [sensorTypes, setSensorTypes] = useState([]);
  const [sensorType, setSensorType] = useState("");
  const [nodeTypes, setNodeTypes] = useState([]);
  const [nodeType, setNodeType] = useState("");
  const [nodeData, setNodeData] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setLoading(true);
    setErrorMessage("");
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    };
    if (tabIndex === 1) {
      // Handle Platform Status
      const currStatus = localStorage.getItem("platformStatus");
      setPlatformStatus(currStatus);
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
          setErrorMessage("Some Error Occurred");
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
          setErrorMessage("Some Error Occurred");
        });
    } else if (tabIndex === 5) {
      // Handle view workflows
    } else if (tabIndex === 7) {
      // Handle VM Health
      setLoading(true);
      getLatestHealthVm();
    } else if (tabIndex === 8) {
      // Handle Live Sensor Data
      setSensorTypes([]);
      setNodeTypes([]);
      setNodeData("");
      fetchSensorTypes();
    } else if (tabIndex === 9) {
      // Handle Load Balancer Status
      setLoading(true);
      const urlServices = "http://20.21.102.175:8050/getAppsDetails";
      const urlStats = "http://20.21.102.175:8050/getAppsHealth";

      const requestServices = axios.get(urlServices);
      const requestStats = axios.get(urlStats);

      Promise.all([requestServices, requestStats])
        .then((response) => {
          console.log(response);
          const services = response[0].data;
          const stats = response[1].data;
          setLoadBalancerServices([...services]);
          setLoadBalancerStats([...stats]);
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
          setErrorMessage("Some Error Occurred");
        });
    } else if (tabIndex === 10) {
      // Handle We@Avishkar
    } else if (tabIndex === 11) {
      setScheduledApps([]);
      axiosAppInstance
        .get("/api/deployedApps/getScheduledApps/", config)
        .then((response) => {
          const { data } = response.data;
          console.log(data);
          setScheduledApps([...data]);
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    } else if (tabIndex === 12) {
      setLoading(true);
      setDeploymentInProgressApps([]);
      axiosAppInstance
        .get("/api/deployedApps/getDeployInProgressApps/", config)
        .then((response) => {
          const { data } = response.data;
          console.log(data);
          setDeploymentInProgressApps([...data]);
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    }
    // setLoading(false);
  }, [tabIndex]);
  useEffect(() => {
    if (sensorType !== "") fetchNodeTypes();
  }, [sensorType]);
  useEffect(() => {
    setNodeData("");
    if (sensorType !== "") fetchNodeData();
  }, [nodeType]);

  const togglePlatformStatus = (e) => {
    e.preventDefault();
    const currStatus = platformStatus;
    if (currStatus === "up") {
      localStorage.setItem("platformStatus", "down");
      setPlatformStatus("down");
    } else {
      localStorage.setItem("platformStatus", "up");
      setPlatformStatus("up");
    }
  };

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

  const getLatestHealthVm = () => {
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
            setErrorMessage("Some Error Occurred");
          });
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
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
        setErrorMessage("Some Error Occurred");
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
        const logsArray = logs.split("\n");
        setCurrentModuleLog(logsArray);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
      });
  };

  const fetchSensorTypes = () => {
    setLoading(true);
    setSensorTypes([]);
    axiosLocationInstance
      .get("/api/platform/sensor/types")
      .then((response) => {
        console.log(response);
        const { data } = response;
        setSensorTypes([...data]);
        setSensorType(data[0]);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const fetchNodeTypes = () => {
    setLoading(true);
    setNodeTypes([]);
    axiosLocationInstance
      .get("/api/platform/sensor/nodes/" + sensorType)
      .then((response) => {
        console.log(response);
        const { data } = response;
        setNodeTypes([...data]);
        setNodeType(data[0]);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const fetchNodeData = () => {
    setLoading(true);
    setNodeData("");
    const url = "/api/platform/sensor/data/" + sensorType + "/" + nodeType;
    axiosLocationInstance
      .get(url)
      .then((response) => {
        setLoading(false);
        console.log(response);
        const { data } = response;
        setNodeData(JSON.stringify(data));
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const handleSensorChange = (e) => {
    e.preventDefault();
    setSensorType(e.target.value);
  };
  const handleNodeChange = (e) => {
    e.preventDefault();
    setNodeType(e.target.value);
  };

  const allSensorTypes = sensorTypes.map((sensor, idx) => (
    <option key={idx} value={sensor}>
      {sensor}
    </option>
  ));
  const allNodeTypes = nodeTypes.map((node, idx) => (
    <option key={idx} value={node}>
      {node}
    </option>
  ));

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
          </li>
          {currentModule === moduleName && (
            <p>
              {currentModuleLog.map((m, i) => (
                <p key={i}>{m}</p>
              ))}
            </p>
          )}
        </div>
      );
    })
  ) : (
    <div className="spinner-border m-2" role="status">
      <span className="visullay-hidden"></span>
    </div>
  );

  const scheduledAppsData = scheduledApps.map((app, idx) => (
    <Cardview
      key={idx}
      appName={app.deployedAppName}
      switchToLocationInput={(e) => console.log("Scheduled App")}
    />
  ));

  const deployInProgressData = deploymentInProgressApps.map((app, idx) => (
    <Cardview
      key={idx}
      appName={app.deployedAppName}
      switchToLocationInput={(e) => console.log("Deploy in progress app")}
    />
  ));

  const vmHealthData = vmHealth.map((v, idx) => {
    return <VmHealth key={idx} data={v} />;
  });
  console.log(platformStatus);
  // const loadBalancerServicesData = loadBalancerServices.map((service, idx) => {
  //   return <LoadBalancerCard key={idx} services={service} isServices={true} />;
  // });

  // const loadBalancerStatsData = loadBalancerStats.map((stat, idx) => {
  //   return <LoadBalancerCard key={idx} services={stat} isServices={false} />;
  // });

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
              <li
                style={{
                  backgroundColor: tabIndex === 1 ? "black" : "#212529",
                }}
              >
                <a className="nav-link px-1">
                  <span className="me-1">
                    <i className="bi bi-check-circle-fill"></i>
                  </span>
                  <span
                    className={tabIndex === 1 ? "btns selctedbtn" : "btns"}
                    onClick={() => setTabIndex(1)}
                    style={{ cursor: "pointer" }}
                    ch
                  >
                    Platform Status
                  </span>
                </a>
              </li>
              <li
                style={{
                  backgroundColor: tabIndex === 2 ? "black" : "#212529",
                }}
              >
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

              <li
                style={{
                  backgroundColor: tabIndex === 3 ? "black" : "#212529",
                }}
              >
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

              <li
                style={{
                  backgroundColor: tabIndex === 4 ? "black" : "#212529",
                }}
              >
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

              <li
                style={{
                  backgroundColor: tabIndex === 11 ? "black" : "#212529",
                }}
              >
                <a className="nav-link px-1">
                  <span className="me-1">
                    <i className="bi bi-eye"></i>
                  </span>
                  <span
                    className={tabIndex === 11 ? "btns selctedbtn" : "btns"}
                    onClick={() => setTabIndex(11)}
                    style={{ cursor: "pointer" }}
                  >
                    View All Scheduled Apps
                  </span>
                </a>
              </li>

              <li
                style={{
                  backgroundColor: tabIndex === 12 ? "black" : "#212529",
                }}
              >
                <a className="nav-link px-1">
                  <span className="me-1">
                    <i className="bi bi-eye"></i>
                  </span>
                  <span
                    className={tabIndex === 12 ? "btns selctedbtn" : "btns"}
                    onClick={() => setTabIndex(12)}
                    style={{ cursor: "pointer" }}
                  >
                    Deployment In Progress
                  </span>
                </a>
              </li>

              <li
                style={{
                  backgroundColor: tabIndex === 5 ? "black" : "#212529",
                }}
              >
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

              <li
                style={{
                  backgroundColor: tabIndex === 7 ? "black" : "#212529",
                }}
              >
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

              <li
                style={{
                  backgroundColor: tabIndex === 8 ? "black" : "#212529",
                }}
              >
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
              <li
                style={{
                  backgroundColor: tabIndex === 9 ? "black" : "#212529",
                }}
              >
                <a className="nav-link px-1">
                  <span className="me-1">
                    <i className="bi bi-check-circle-fill"></i>
                  </span>
                  <span
                    className={tabIndex === 9 ? "btns selctedbtn" : "btns"}
                    onClick={() => setTabIndex(9)}
                    style={{ cursor: "pointer" }}
                  >
                    Load Balancer Status
                  </span>
                </a>
              </li>
              <li
                style={{
                  backgroundColor: tabIndex === 10 ? "black" : "#212529",
                }}
              >
                <a className="nav-link px-1">
                  <span className="me-1">
                    <i className="bi bi-info-circle"></i>
                  </span>
                  <span
                    className={tabIndex === 10 ? "btns selctedbtn" : "btns"}
                    onClick={() => setTabIndex(10)}
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
                  <input
                    type="checkbox"
                    checked={platformStatus === "up" ? true : false}
                    onChange={togglePlatformStatus}
                  />
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
                    {uploadedAppsData.length ? (
                      uploadedAppsData
                    ) : isLoading ? (
                      <div className="spinner-border m-2" role="status">
                        <span className="visullay-hidden"></span>
                      </div>
                    ) : (
                      <h2>No Uploaded Apps</h2>
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
                    {deployedAppsData.length ? (
                      deployedAppsData
                    ) : isLoading ? (
                      <div className="spinner-border m-2" role="status">
                        <span className="visullay-hidden"></span>
                      </div>
                    ) : (
                      <h2>No deployed Apps</h2>
                    )}
                  </div>
                </Loader>
              </div>
            </div>
          </main>
        )}
        {tabIndex === 11 && (
          <main className="mt-5 pt-1">
            <div className="container-fluid">
              <div className="row mt-5">
                <Loader spinning={isLoading}>
                  <div className="card-container">
                    {scheduledAppsData.length ? (
                      scheduledAppsData
                    ) : isLoading ? (
                      <div className="spinner-border m-2" role="status">
                        <span className="visullay-hidden"></span>
                      </div>
                    ) : (
                      <h2>No scheduled Apps</h2>
                    )}
                  </div>
                </Loader>
              </div>
            </div>
          </main>
        )}
        {tabIndex === 12 && (
          <main className="mt-5 pt-1">
            <div className="container-fluid">
              <div className="row mt-5">
                <Loader spinning={isLoading}>
                  <div className="card-container">
                    {deployInProgressData.length ? (
                      deployInProgressData
                    ) : isLoading ? (
                      <div className="spinner-border m-2" role="status">
                        <span className="visullay-hidden"></span>
                      </div>
                    ) : (
                      <h2>No apps currently under deployment</h2>
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
              onClick={getLatestHealthVm}
            >
              Refresh
            </button>
            <br />
            <br />
            <div>
              <main className="mt-5 pt-1">
                <div className="container-fluid">
                  <div className="row">
                    <div className="card-container mt-5">
                      {!isLoading ? (
                        vmHealthData
                      ) : (
                        <>
                          <h4>Fetching VM's health</h4>
                          <br />
                          <div className="spinner-border m-2" role="status">
                            <span className="visullay-hidden"></span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </main>
              <style jsx>{`
                .card-container {
                  display: flex;
                  margin: 10 -10px;
                }
                .card-container > * {
                  margin: 0 10px;
                }
              `}</style>
            </div>
          </div>
        )}
        {tabIndex === 8 && (
          <div>
            <main className="mt-5 pt-3">
              <div className="container-fluid">
                <div className="main">
                  <Loader spinning={tabIndex === 8 && isLoading}>
                    <div className="location">
                      <h2>Sensor Types</h2>
                      <select
                        className="form-select form-select-lg mb-3"
                        aria-label=".form-select-lg example location-selected"
                        onChange={handleSensorChange}
                      >
                        {allSensorTypes}
                      </select>
                      <h2>Node Types</h2>
                      <select
                        className="form-select form-select-lg mb-3"
                        aria-label=".form-select-lg example location-selected"
                        onChange={handleNodeChange}
                      >
                        {allNodeTypes}
                      </select>
                      {nodeData}
                      <br />
                    </div>
                  </Loader>
                </div>
              </div>
            </main>
          </div>
        )}
        {tabIndex === 9 && (
          <main className="mt-5 pt-3">
            <div className="container-fluid ml-5">
              <div className="row">
                {isLoading ? (
                  <div className="spinner-border m-2" role="status">
                    <span className="visullay-hidden"></span>
                  </div>
                ) : (
                  <>
                    {" "}
                    {/* <div>{loadBalancerServicesData}</div> */}
                    <div>
                      <LoadBalancerCard
                        services={loadBalancerServices}
                        isServices={true}
                        name="All Services"
                      />
                      <LoadBalancerCard
                        services={loadBalancerStats}
                        isServices={false}
                        name="All Modules Stats"
                      />
                    </div>
                    {/* <div>{loadBalancerStatsData}</div> */}
                  </>
                )}
              </div>
            </div>
          </main>
        )}
        {tabIndex === 10 && <AboutUs />}
      </div>
    </div>
  );
}
export default Leftbar;
