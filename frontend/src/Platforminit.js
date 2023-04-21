import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Platforminit.css";
import Navbar from "./Navbar";
import { axiosAppInstance } from "./axiosInstance";
import Loader from "./Loader";
function Platforminit() {
  // Set tabIndex to 1 by default to show the first tab on load
  const [tabIndex, setTabIndex] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoggedIn, setLoggedIn] = useState(true);
  const [allApps, setAllApps] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      setLoggedIn(false);
      navigate("/");
    } else if (localStorage.getItem("role") === "dev") navigate("/home");
  }, [isLoggedIn]);

  const handleStart = () => {
    setIsRunning(true);
    // code to start the process
  };

  const handleStop = () => {
    setIsRunning(false);
    // code to stop the process
  };

  useEffect(() => {
    if (tabIndex === 2) {
      setLoading(true);
      setAllApps([]);
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };
      axiosAppInstance
        .get("/api/app/getapps/", config)
        .then((response) => {
          const { data } = response.data;
          setAllApps([...data]);
          setLoading(false);
          console.log(response);
        })
        .catch((err) => {
          setLoading(false);
          console.log(err);
        });
    }
  }, [tabIndex]);

  const allAppsBody = allApps.map((app, idx) => {
    return (
      <p
        key={idx}
        onClick={(e) => window.open(`http://${app.url}`, "_blank")}
        style={{ cursor: "pointer" }}
      >
        {app.appname}
      </p>
    );
  });
  return (
    <div>
      <nav>
        <Navbar />
      </nav>
      <h1 className="userType2">Platform Admin</h1>
      <div className="mainclass2">
        <div>
          <button
            className={tabIndex === 1 ? "btns selctedbtn" : "btns"}
            onClick={() => setTabIndex(1)}
          >
            Status
          </button>
          <br />
          <button
            className={tabIndex === 2 ? "btns selctedbtn" : "btns"}
            onClick={() => setTabIndex(2)}
          >
            List all deployed apps
          </button>
        </div>
        <Loader spinning={isLoading}>
          <div>
            {tabIndex === 1 && (
              <div className="center2">
                <label className="fileupload2" htmlFor="myfile">
                  Current platform running status :
                </label>
                <br />
                <button className="runningBtn" type="button" disabled>
                  Running
                </button>
                <br />
                <label className="fileupload2" htmlFor="myfile">
                  To start and stop platform :
                </label>
                <div>
                  {isRunning ? (
                    <button className="startbtn" onClick={handleStop}>
                      Stop Platform
                    </button>
                  ) : (
                    <button className="startbtn" onClick={handleStart}>
                      Start Platform
                    </button>
                  )}
                </div>
              </div>
            )}
            {tabIndex === 2 && (
              <div className="center2">
                <div className="scrollarea2   ">{allAppsBody}</div>
              </div>
            )}
          </div>
        </Loader>
      </div>
    </div>
  );
}
export default Platforminit;
