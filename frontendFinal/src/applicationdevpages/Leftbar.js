import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/style.css";
import { axiosAppInstance } from "../utils/axiosInstance";
import Cardview from "../enduserpages/Cardview";
import Loader from "../utils/Loader";

// LeftBar of App Developer

function Leftbar() {
  const [tabIndex, setTabIndex] = useState(1);
  const [isLoading, setLoading] = useState(false);
  const [uploadedApps, setUploadedApps] = useState([]);
  const [deployedApps, setDeployedApps] = useState([]);
  const [inpFile, setFile] = useState();
  const [submitBtnStatus, setSubmitBtnStatus] = useState(false);
  const [validationMsg, setValidationMsg] = useState("");
  const [appToDeploy, setAppToDeploy] = useState("");
  const [sensorLocation, setSensorLocation] = useState("OBH");
  const [isDateTimeEnabled, setIsDateTimeEnabled] = useState(false);
  const handleTabIndex = (e) => {
    e.preventDefault();
    setAppToDeploy("");
    if (e.target.id === "uploadApp") setTabIndex(1);
    if (e.target.id === "uploadWorkflow") setTabIndex(2);
    if (e.target.id === "viewUploadedApps") setTabIndex(3);
    if (e.target.id === "viewDeployedApps") setTabIndex(4);
    if (e.target.id === "viewWorkflows") setTabIndex(5);
    if (e.target.id === "docs") setTabIndex(6);
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    setLoading(true);
    if (tabIndex === 3) {
      // Fetch uploadedApps
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
      // Fetch deployedApps
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
      // Fetch workflows
    }
    setLoading(false);
  }, [tabIndex]);

  const handleFileNameCheck = () => {
    setValidationMsg("");
    setSubmitBtnStatus(false);
    setLoading(true);
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("inpFile", inpFile);
    const config = {
      headers: {
        "content-type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    };
    axiosAppInstance
      .post("/api/baseApp/checkfilename/", formData, config)
      .then((response) => {
        setLoading(false);
        const { data, message } = response.data;
        setValidationMsg(message);
        if (data) setSubmitBtnStatus(true);
        else setSubmitBtnStatus(false);
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
        const { data } = err.response.data;
        setValidationMsg(data);
      });
  };

  useEffect(() => {
    if (inpFile) handleFileNameCheck();
  }, [inpFile]);

  const handleChange = (e) => {
    e.preventDefault();
    const file = e.target.files;
    setFile(file[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationMsg("");
    setLoading(true);
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("inpFile", inpFile);
    const config = {
      headers: {
        "content-type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    };
    axiosAppInstance
      .post("/api/baseApp/upload/", formData, config)
      .then((response) => {
        setLoading(false);
        console.log(response);
        const { message } = response.data;
        setValidationMsg(message);
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
        const { data } = err.response.data;
        setValidationMsg(data);
      });
  };

  const toggleDateTime = (e) => e.preventDefault();

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
                    onClick={handleTabIndex}
                    id="uploadApp"
                    style={{ cursor: "pointer" }}
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
                    onClick={handleTabIndex}
                    id="uploadWorkflow"
                    style={{ cursor: "pointer" }}
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
                    onClick={handleTabIndex}
                    id="viewUploadedApps"
                    style={{ cursor: "pointer" }}
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
                    onClick={handleTabIndex}
                    id="viewDeployedApps"
                    style={{ cursor: "pointer" }}
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
                    onClick={handleTabIndex}
                    id="viewWorkflows"
                    style={{ cursor: "pointer" }}
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
                    onClick={handleTabIndex}
                    id="docs"
                    style={{ cursor: "pointer" }}
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
                  <Loader spinning={tabIndex === 1 && isLoading}>
                    <div className="center">
                      <h1>Upload Application</h1>
                      <hr />
                      <label className="form-label" for="customFile">
                        In .zip format
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        id="inpFile"
                        onChange={handleChange}
                      />
                      <br />
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleSubmit}
                        disabled={!submitBtnStatus}
                      >
                        Submit
                      </button>
                      <p>{validationMsg}</p>
                    </div>
                  </Loader>
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
                  <Loader spinning={tabIndex === 2 && isLoading}>
                    <div className="center">
                      <h1>Upload Workflow</h1>
                      <hr />
                      <label className="form-label" for="customFile">
                        In .json format
                      </label>
                      <input
                        type="file"
                        clasNames="form-control"
                        id="customFile"
                      />
                      <br />
                      <button type="button" className="btn btn-secondary">
                        Submit
                      </button>
                    </div>
                  </Loader>
                </div>
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
