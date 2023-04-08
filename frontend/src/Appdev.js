import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Appdev.css";
import Navbar from "./Navbar";
function Appdev() {
  // Set tabIndex to 1 by default to show the first tab on load
  const [tabIndex, setTabIndex] = useState(1);

  return (
    <div>
      <nav>
        <Navbar />
      </nav>
      <h1 className="userType">Application Developer</h1>
      <div className="mainclass">
        <div>
          <button className="btns " onClick={() => setTabIndex(1)}>
            Upload App
          </button>
          <br />
          <button className="btns" onClick={() => setTabIndex(2)}>
            View all deployed apps
          </button>
        </div>
        <div>
          {tabIndex === 1 && (
            <div className="center1">
              <label className="fileupload" htmlFor="myfile">
                Upload app
              </label>
              <sub>&nbsp;&nbsp;&nbsp;.txt, .zip</sub>
              <br />
              <input type="file" id="myfile" name="myfile" />
              <br />
              <label className="fileupload"> Rules to upload app file</label>
              <br />
              <div className="download">
                <a href="timetable.pdf" download>
                  <b>download pdf </b>
                </a>
              </div>
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
                <p>
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Placeat ea totam, aut tenetur et ratione ut nisi reprehenderit
                  ducimus consequatur cupiditate recusandae iusto accusamus
                  voluptas exercitationem commodi, quod amet laborum.
                </p>

                <p>
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Placeat ea totam, aut tenetur et ratione ut nisi reprehenderit
                  ducimus consequatur cupiditate recusandae iusto accusamus
                  voluptas exercitationem commodi, quod amet laborum.
                </p>

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
