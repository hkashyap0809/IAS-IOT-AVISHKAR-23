import React from "react";

function VmHealth(props) {
  const { data } = props;
  const cpuUsage = data["CPU Usage"];
  const diskUsage = data["Disk Usage"];
  const health = data["Health"];
  const memory = data["Memory Usage"];
  const name = data["name"];
  console.log(props);
  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h6 className="card-title">{name}</h6>
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
                  style={{ width: `${diskUsage}%` }}
                  aria-valuenow={diskUsage}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >{`${diskUsage}%`}</div>
              </div>
            </li>
            <li className="list-group-item">
              <strong>Memory Usage:</strong>
              <div className="progress">
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: `${memory}%` }}
                  aria-valuenow={memory}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >{`${memory}%`}</div>
              </div>
            </li>
            <li className="list-group-item">
              <strong>Health:</strong>
              <div className="progress">
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: `${health}%` }}
                  aria-valuenow={health}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >{`${health}%`}</div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default VmHealth;
