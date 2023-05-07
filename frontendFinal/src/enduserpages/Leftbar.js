import React, { useState, useEffect } from "react";
import "../css/style.css";
import Cardview from "../enduserpages/Cardview";
import Loader from "../utils/Loader";
import {
  axiosAppInstance,
  axiosLocationInstance,
} from "../utils/axiosInstance";
import AboutUs from "../AboutUs";

function Leftbar() {
  const [tabIndex, setTabIndex] = useState(1);
  const [uploadedApps, setUploadedApps] = useState([]);
  const [deployedApps, setDeployedApps] = useState([]);
  const [scheduledApps, setScheduledApps] = useState([]);
  const [deploymentInProgressApps, setDeploymentInProgressApps] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [isDateTimeEnabled, setIsDateTimeEnabled] = useState(false);
  const [sensorLocation, setSensorLocation] = useState([]);
  const [validationMsg, setValidationMsg] = useState("");
  const [appToDeploy, setAppToDeploy] = useState("");
  const [applicationType, setApplicationType] = useState("");
  const [location, setLocation] = useState("");
  const [mode, setMode] = useState("deploy");
  const [userEmail, setUserEmail] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [allNodes, setAllNodes] = useState([]);
  const [allNodesCheckBox, setNodesCheckBox] = useState([]);
  const [typeLocationBinding, setTypeLocationBinding] = useState([]);
  const [sensorLocationBinding, setSensorLocationBinding] = useState({});
  const [allCheckBoxes, setAllCheckBoxes] = useState([]);
  const [checkboxStatus, toggleCheckboxStatus] = useState([]);
  const handleTabIndex = (e) => {
    e.preventDefault();
    setAppToDeploy("");
    if (e.target.id === "upload") setTabIndex(1);
    if (e.target.id === "view") setTabIndex(2);
    if (e.target.id === "schedule") setTabIndex(5);
    if (e.target.id === "we") setTabIndex(4);
    if (e.target.id === "deployProgress") setTabIndex(3);
  };
  const handleUserEmail = (e) => {
    e.preventDefault();
    setUserEmail(e.target.value);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    setLoading(true);
    if (tabIndex === 1) {
      setUploadedApps([]);
      axiosAppInstance
        .get("/api/baseApp/getapps/", config)
        .then((response) => {
          const { data } = response.data;
          console.log(data);
          setUploadedApps([...data]);
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    } else if (tabIndex === 2) {
      setDeployedApps([]);
      axiosAppInstance
        .get("/api/deployedApps/getDeployedApps/", config)
        .then((response) => {
          const { data } = response.data;
          console.log(data);
          setDeployedApps([...data]);
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    } else if (tabIndex === 0) {
      setLoading(true);
      setMode("deploy");
      setUserEmail("");
      setStartTime("");
      setEndTime("");
      setSensorLocation([]);
      setTypeLocationBinding([]);
      const url =
        "/api/sensor/intersection/verticals?applicationType=" + applicationType;
      axiosLocationInstance
        .get(url)
        .then((response) => {
          console.log(response);
          const { data } = response;
          setSensorLocation([...data]);
          setLocation(data[0]);
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    } else if (tabIndex === 5) {
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
    } else if (tabIndex === 3) {
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
    const url =
      "/api/sensor/intersection/nodes?applicationType=" +
      applicationType +
      "&location=" +
      location;
    axiosLocationInstance
      .get(url)
      .then((response) => {
        console.log(response);
        const { data } = response;
        const arr = data.map((d) => {
          return {
            ...d,
            [d["checked"]]: false,
          };
        });
        setAllCheckBoxes([...arr]);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [location]);

  const toggleDateTime = (e) => setIsDateTimeEnabled(!isDateTimeEnabled);
  const handleToggleCheckbox = (e) => {
    let copyArr = [...allCheckBoxes];
    let elt = copyArr.find((c) => c["text"] === e.target.id);
    if (elt["checked"]) {
      // Checkbox is selected
      // Uncheck it
      let obj = { ...sensorLocationBinding };
      let filteredArr = obj[e.target.name].filter((f) => f !== e.target.id);
      obj[e.target.name] = filteredArr;
      setSensorLocationBinding(obj);
      elt["checked"] = false;
      setAllCheckBoxes(copyArr);
    } else {
      // Checkbox is not selected
      // Check it
      let obj = { ...sensorLocationBinding };
      console.log(obj);
      console.log(e.target.name);
      if (e.target.name in obj) {
        obj[e.target.name].push(e.target.value);
      } else {
        obj[e.target.name] = [e.target.value];
      }
      setSensorLocationBinding(obj);
      elt["checked"] = true;
      setAllCheckBoxes(copyArr);
    }
  };

  const switchToLocationInput = (
    e,
    isUploadCard,
    appId,
    appName,
    developer,
    url,
    appType
  ) => {
    if (isUploadCard) {
      setApplicationType(appType);
      setTabIndex(0);
      setAppToDeploy({
        baseAppId: appId,
        baseAppName: appName,
        developer: developer,
      });
    } else if (tabIndex === 2) {
      window.open(url, "_blank");
    }
  };

  const handleModeChange = (e) => {
    console.log(e.target.value);
    e.preventDefault();
    setMode(e.target.value);
  };

  const handleTimeChange = (e) => {
    e.preventDefault();
    console.log(e.target.value);
    if (e.target.name === "starttime") {
      setStartTime(e.target.value);
    } else if (e.target.name === "endtime") {
      setEndTime(e.target.value);
    }
  };

  const stopDeployedApp = (e, appId) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    axiosAppInstance(
      "/api/deployedApps/stopApp/",
      {
        appId,
      },
      config
    )
      .then((response) => {
        console.log(response);
      })
      .catch((err) => {
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
            true,
            app.id,
            app.appName,
            app.developer,
            "",
            app.appType
          )
        }
      />
    ))
  ) : (
    <div>No apps uploaded!</div>
  );
  const deployedAppsData = deployedApps.length ? (
    deployedApps.map((app, idx) => (
      <>
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
              app.url,
              app.appType
            )
          }
        />
        <button onClick={(e) => stopDeployedApp(e, app.deployedAppName)}>
          Stop App
        </button>
      </>
    ))
  ) : (
    <p>No deployed apps!</p>
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

  const nodeCheckBoxes = allCheckBoxes.map((s, idx) => {
    return (
      <>
        <input
          key={idx}
          type="checkbox"
          id={s.text}
          value={s.node}
          name={s.sensorType}
          onChange={handleToggleCheckbox}
          checked={allCheckBoxes[idx]["checked"]}
        />
        <label htmlFor={s.node}>{s.text}</label>
        <br />
      </>
    );
  });

  const handleDeploy = (e) => {
    e.preventDefault();
    if (appToDeploy && userEmail) {
      setLoading(true);
      setValidationMsg("");
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { baseAppId, baseAppName, developer } = appToDeploy;
      console.log(JSON.stringify(sensorLocationBinding));
      console.log(sensorLocationBinding);
      const obj = {
        baseAppId,
        baseAppName,
        location: JSON.stringify(sensorLocationBinding),
        developer,
        userEmail,
      };
      if (mode === "deploy") {
        axiosAppInstance
          .post("/api/deployedApps/deployApp/", obj, config)
          .then((response) => {
            setLoading(false);
            console.log(response);
            const { message } = response.data;
            setValidationMsg(message);
          })
          .catch((err) => {
            setLoading(false);
            console.log(err);
          });
      } else if (mode === "schedule") {
        obj["startTime"] = startTime;
        obj["endTime"] = endTime;
        axiosAppInstance
          .post("/api/deployedApps/scheduleApp/", obj, config)
          .then((response) => {
            setLoading(false);
            console.log(response);
            const { message } = response.data;
            setValidationMsg(message);
          })
          .catch((err) => {
            setLoading(false);
            console.log(err);
          });
      }
    }
  };

  const handleOptionSelect = (e) => {
    e.preventDefault();
    setLocation(e.target.value);
  };

  const optionsData = sensorLocation.map((l, idx) => (
    <option key={idx} value={l}>
      {l}
    </option>
  ));
  console.log("Location is: ", location);
  console.log("Location array is: ", sensorLocation);
  console.log(sensorLocationBinding);
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
              <li
                style={{
                  backgroundColor: tabIndex === 1 ? "black" : "#212529",
                }}
              >
                <a className="nav-link px-1">
                  <span className="me-1">
                    <i className="bi bi-eye"></i>
                  </span>
                  <span
                    className={tabIndex === 1 ? "btns selctedbtn" : "btns"}
                    onClick={handleTabIndex}
                    style={{ cursor: "pointer" }}
                    id="upload"
                  >
                    View All Uploaded Apps
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
                    <i className="bi bi-eye"></i>
                  </span>
                  <span
                    className={tabIndex === 2 ? "btns selctedbtn" : "btns"}
                    onClick={handleTabIndex}
                    id="view"
                    style={{ cursor: "pointer" }}
                  >
                    View Deployed Apps
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
                    onClick={handleTabIndex}
                    id="schedule"
                    style={{ cursor: "pointer" }}
                  >
                    View Scheduled Apps
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
                    <i className="bi bi-calendar-event"></i>
                  </span>
                  <span
                    className={tabIndex === 3 ? "btns selctedbtn" : "btns"}
                    onClick={handleTabIndex}
                    id="deployProgress"
                    style={{ cursor: "pointer" }}
                  >
                    Deployment In Progress
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
                    <i className="bi bi-info-circle"></i>
                  </span>
                  <span
                    className={tabIndex === 4 ? "btns selctedbtn" : "btns"}
                    onClick={handleTabIndex}
                    id="we"
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
          <main className="mt-5 pt-1">
            <div className="container-fluid">
              <div className="row mt-5">
                <Loader spinning={isLoading}>
                  <div className="card-container">
                    {uploadedAppsData.length ? (
                      uploadedAppsData
                    ) : (
                      <div className="spinner-border m-2" role="status">
                        <span className="visullay-hidden"></span>
                      </div>
                    )}
                  </div>
                </Loader>
              </div>
            </div>
          </main>
        )}
        {tabIndex === 2 && (
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
        {tabIndex === 3 && (
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
        {tabIndex === 0 && (
          <div>
            <main className="mt-5 pt-3">
              <div className="container-fluid">
                <div className="main">
                  <Loader spinning={tabIndex === 0 && isLoading}>
                    <div className="location">
                      <h2>Locations</h2>
                      <select
                        className="form-select form-select-lg mb-3"
                        aria-label=".form-select-lg example location-selected"
                        onChange={handleOptionSelect}
                      >
                        {optionsData}
                      </select>
                      {nodeCheckBoxes}
                      <br />
                    </div>

                    {/* <button
                      onClick={toggleDateTime}
                      type="button"
                      className="btn btn-info"
                    >
                      Schedule
                    </button> */}
                    <label htmlFor="userEmail">Email: </label>
                    <input
                      type="email"
                      name="userEmail"
                      value={userEmail}
                      onChange={handleUserEmail}
                    />
                    <br />
                    <br />
                    <select onChange={handleModeChange}>
                      <option value="deploy">Deploy</option>
                      <option value="schedule">Schedule</option>
                    </select>
                    <div
                      className="datetime"
                      style={{
                        display: mode === "schedule" ? "block" : "none",
                      }}
                    >
                      <label htmlFor="starttime">Start (date and time):</label>
                      <input
                        type="datetime-local"
                        id="starttime"
                        name="starttime"
                        onChange={handleTimeChange}
                      />
                      <br />
                      <br />
                      <label htmlFor="endtime">End (date and time):</label>
                      <input
                        type="datetime-local"
                        id="endtime"
                        name="endtime"
                        onChange={handleTimeChange}
                      />
                      <br />
                      <br />
                    </div>
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={handleDeploy}
                    >
                      {mode === "deploy" ? "Deploy App" : "Schedule App"}
                    </button>
                    <p>{validationMsg}</p>
                  </Loader>
                </div>
              </div>
            </main>
          </div>
        )}
        {tabIndex === 4 && <AboutUs />}
        {tabIndex === 5 && (
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
      </div>
    </div>
  );
}
export default Leftbar;
