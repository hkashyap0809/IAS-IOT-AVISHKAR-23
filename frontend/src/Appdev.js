import React, { useState } from "react";
import axios from "axios";
// import { useNavigate, Link } from "react-router-dom";
import "./Appdev.css";
import Navbar from "./Navbar";
function Appdev() {
  // Set tabIndex to 1 by default to show the first tab on load
  const [tabIndex, setTabIndex] = useState(1);
  const [inpFile, setFile] = useState();
  const [validationMsg, setValidationMsg] = useState();
  const handleChange = (e) => {
    e.preventDefault();
    setFile(e.target.files[0]);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationMsg("");
    const formData = new FormData();
    formData.append("inpFile", inpFile);
    const config = {
      headers: {
        "content-type": "multipart/form-data",
      },
    };
    axios
      .post("http://localhost:5000/api/upload/file/", formData, config)
      .then((response) => {
        console.log(response);
        const { message } = response.data;
        setValidationMsg(message);
      })
      .catch((err) => {
        console.log(err);
        const { data } = err.response.data;
        setValidationMsg(data);
      });
  };

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
              />
            </div>
          )}
          {tabIndex === 2 && (
            <div className="center1">
              <div className="scrollarea">
                <p>
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Placeat ea totam, aut tenetur et ratione ut nisi reprehenderit
                  ducimus consequatur cupiditate recusandae iusto accusamus
                  voluptas exercitationem commodi, quod amet laborum.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default Appdev;
