import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Vmhealth() {
  const cpuUsage = 83; // example value
  const diskMemory = 50; // example value
  const Health = 90; // example value
  const Memory = 12; // example value
  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h6 className="card-title">Virtual Machine-1</h6>
        </div>
        <div className="card-body">
          <ul className="list-group list-group-flush">
            <li className="list-group-item">
              <strong>CPU Usage:</strong>
              <div className="progress">
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: `${cpuUsage}%` }}
                  aria-valuenow={cpuUsage}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >{`${cpuUsage}%`}</div>
              </div>
            </li>
            <li className="list-group-item">
              <strong>Disk Usage:</strong>
              <div className="progress">
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: `${diskMemory}%` }}
                  aria-valuenow={diskMemory}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >{`${diskMemory}%`}</div>
              </div>
            </li>
            <li className="list-group-item">
              <strong>Memory Usage:</strong>
              <div className="progress">
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: `${Memory}%` }}
                  aria-valuenow={diskMemory}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >{`${Memory}%`}</div>
              </div>
            </li>
            <li className="list-group-item">
              <strong>Health:</strong>
              <div className="progress">
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: `${Health}%` }}
                  aria-valuenow={diskMemory}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >{`${Health}%`}</div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
export default Vmhealth;
