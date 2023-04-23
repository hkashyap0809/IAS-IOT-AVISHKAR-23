import React from "react";
import "./Userinput";
function Cardview(props) {
  const { appName, switchToLocationInput } = props;
  return (
    <div onClick={switchToLocationInput} style={{ cursor: "pointer" }}>
      <main className="mt-5 pt-3">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-3 mb-3">
              <div className="card bg-primary text-white h-40">
                <div className="card-body py-5 fs-5 text-dark  text-decoration-none ">
                  {appName}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
export default Cardview;
