import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Userinput";
function Cardview() {
  return (
    <div>
      <main className="mt-5 pt-3">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-3 mb-3">
              <div className="card bg-primary text-white h-40">
                <a
                  href="./Userinput"
                  className="card-body py-5 fs-5 text-dark  text-decoration-none "
                >
                  Air Quality
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
export default Cardview;
