import React, { useState, useEffect } from "react";
import "../css/style.css";
import Cardview from "../enduserpages/Cardview";
import Loader from "../utils/Loader";
import {
  axiosAppInstance,
  axiosLocationInstance,
} from "../utils/axiosInstance";
import AboutUs from "../AboutUs";
import axios from "axios";
function Leftbar() {
  const [tabIndex, setTabIndex] = useState(1);
  const [uploadedApps, setUploadedApps] = useState([]);
  const [deployedApps, setDeployedApps] = useState([]);
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
  const handleTabIndex = (e) => {
    e.preventDefault();
    setAppToDeploy("");
    if (e.target.id === "upload") setTabIndex(1);
    if (e.target.id === "view") setTabIndex(2);
    if (e.target.id === "schedule") setTabIndex(3);
    if (e.target.id === "we") setTabIndex(4);
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
      // const url = `http://20.21.102.175:2041/api/sensor/location/${applicationType}`;
      // const url = `http://192.168.202.134:8050/api/sensor/location/${applicationType}`;
      axiosLocationInstance
        .get(`/api/sensor/location/${applicationType}`)
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
    }
    setLoading(false);
  }, [tabIndex]);

  const toggleDateTime = (e) => setIsDateTimeEnabled(!isDateTimeEnabled);

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
    if (e.target.name === "starttime") {
      setStartTime(e.target.value);
    } else if (e.target.name === "endtime") {
      setEndTime(e.target.value);
    }
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
    ))
  ) : (
    <p>No deployed apps!</p>
  );

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
      const obj = {
        baseAppId,
        baseAppName,
        location,
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
                    id="schedule"
                    style={{ cursor: "pointer" }}
                  >
                    Scheduling/Deployment
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
        {tabIndex === 3 && <div></div>}
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
      </div>
    </div>
  );
}
export default Leftbar;
