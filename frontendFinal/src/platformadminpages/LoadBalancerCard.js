import React from "react";

const LoadBalancerCard = ({ services, isServices, name }) => {
  console.log(services);
  return (
    <div>
      <h2>{name}</h2>
      <hr />
      <ul className="ml-1">
        {services.map((service) => (
          <li key={service.appName}>
            <h3>{service.appName}</h3>
            {isServices && (
              <>
                <p>
                  <strong>Container Ids: </strong>
                  {JSON.stringify(service.containerIds)}
                </p>
                <p>
                  <strong>Container Port: </strong>
                  {service.containerPort}
                </p>
                <p>
                  <strong>End Point: </strong>
                  {service.endpoint}
                </p>
                <p>
                  <strong>Host Ports: </strong>
                  {JSON.stringify(service.hostPorts)}
                </p>
                <p>
                  <strong>Host Vm: </strong>
                  {service.hostVm}
                </p>
                <p>
                  <strong>Image Name: </strong>
                  {service.imageName}
                </p>
                <p>
                  <strong>Instances: </strong>
                  {service.instances}
                </p>
                <p>
                  <strong>Nginx Port:</strong>
                  {service.nginxPort}
                </p>
              </>
            )}
            {!isServices && (
              <>
                <p>
                  <strong>Stats: </strong>
                  {service.stats}
                </p>
              </>
            )}
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LoadBalancerCard;
