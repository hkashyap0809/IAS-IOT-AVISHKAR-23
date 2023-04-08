import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Platforminit.css";
import Navbar from "./Navbar";
function Platforminit() {
  // Set tabIndex to 1 by default to show the first tab on load
  const [tabIndex, setTabIndex] = useState(1);

  const [isRunning, setIsRunning] = useState(false);

  const handleStart = () => {
    setIsRunning(true);
    // code to start the process
  };

  const handleStop = () => {
    setIsRunning(false);
    // code to stop the process
  };
  return (
    <div>
      <nav>
        <Navbar />
      </nav>
      <h1 className="userType2">Platform Admin</h1>
      <div className="mainclass2">
        <div>
          <button className="btn " onClick={() => setTabIndex(1)}>
            Status
          </button>
          <br />
          <button className="btn" onClick={() => setTabIndex(2)}>
            List all deployed apps
          </button>
        </div>
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
              <div className="scrollarea2   ">
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
export default Platforminit;