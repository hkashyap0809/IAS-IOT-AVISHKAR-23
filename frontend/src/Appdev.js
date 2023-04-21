import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { axiosAppInstance } from "./axiosInstance";
import "./Appdev.css";
import Navbar from "./Navbar";
import Loader from "./Loader";
function Appdev() {
  // Set tabIndex to 1 by default to show the first tab on load
  const [tabIndex, setTabIndex] = useState(1);
  const [inpFile, setFile] = useState();
  const [validationMsg, setValidationMsg] = useState();
  const [isLoggedIn, setLoggedIn] = useState(true);
  const [submitBtnStatus, setSubmitBtnStatus] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [deployedApps, setDeployedApps] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      setLoggedIn(false);
      navigate("/");
    } else if (localStorage.getItem("role") === "admin") navigate("/platform");
  }, [isLoggedIn]);

  const handleFileNameCheck = () => {
    setValidationMsg("");
    setSubmitBtnStatus(false);
    setLoading(true);
    const formData = new FormData();
    formData.append("inpFile", inpFile);
    const config = {
      headers: {
        "content-type": "multipart/form-data",
      },
    };
    axiosAppInstance
      .post("/api/app/checkfilename/", formData, config)
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
    console.log(inpFile);
    if (inpFile) handleFileNameCheck();
  }, [inpFile]);

  useEffect(() => {
    if (tabIndex === 2) {
      setLoading(true);
      setDeployedApps([]);
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };
      axiosAppInstance
        .get(`/api/app/getapps/`, config)
        .then((response) => {
          const { data } = response.data;
          setDeployedApps([...data]);
          setLoading(false);
          console.log(response);
        })
        .catch((err) => {
          setLoading(false);
          console.log(err);
        });
    }
  }, [tabIndex]);

  const handleChange = (e) => {
    e.preventDefault();
    const file = e.target.files;
    setFile(file[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationMsg("");
    setLoading(true);
    const formData = new FormData();
    formData.append("inpFile", inpFile);
    const config = {
      headers: {
        "content-type": "multipart/form-data",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    };
    axiosAppInstance
      .post("/api/app/upload/", formData, config)
      .then((response) => {
        setLoading(false);
        console.log(response);
        const { message } = response.data;
        const { msg } = response.data.data;
        setValidationMsg(msg);
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
        const { data } = err.response.data;
        setValidationMsg(data);
      });
  };

  const deployedAppsBody = deployedApps.map((app, idx) => {
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
      <h1 className="userType">Application Developer</h1>
      <div className="mainclass">
        <div>
          <button
            className={tabIndex === 1 ? "btns selctedbtn" : "btns"}
            onClick={() => setTabIndex(1)}
          >
            Upload App
          </button>
          <br />
          <button
            className={tabIndex === 2 ? "btns selctedbtn" : "btns"}
            onClick={() => setTabIndex(2)}
          >
            View all deployed apps
          </button>
        </div>
        <Loader spinning={isLoading}>
          <div>
            {tabIndex === 1 && (
              <div className="center1">
                <label className="fileupload" htmlFor="myfile">
                  Upload app
                </label>
                <sub>&nbsp;&nbsp;&nbsp;.zip</sub>
                <br />
                <input
                  type="file"
                  id="inpFile"
                  name="myfile"
                  onChange={handleChange}
                />
                <br />
                <a className="samplepdf" href="#">
                  {" "}
                  Sample Contract Format
                </a>
                <br />
                <input
                  type="button"
                  className="submitbtn"
                  value="Submit"
                  onClick={handleSubmit}
                  disabled={!submitBtnStatus}
                />
                <p>{validationMsg}</p>
              </div>
            )}
            {tabIndex === 2 && (
              <div className="center1">
                <div className="scrollarea">
                  {/* <p>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Placeat ea totam, aut tenetur et ratione ut nisi
                    reprehenderit ducimus consequatur cupiditate recusandae
                    iusto accusamus voluptas exercitationem commodi, quod amet
                    laborum.
                  </p> */}
                  {deployedAppsBody}
                </div>
              </div>
            )}
          </div>
        </Loader>
      </div>
    </div>
  );
}
export default Appdev;
