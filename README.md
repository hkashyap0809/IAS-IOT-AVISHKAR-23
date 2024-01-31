# INTENRALS OF APPLICATION SERVER | DISTRIBUTED IOT PLATFORM - AVISHKAR

<!-- Message highlighted in pink are doubts. -->

# Platform initializer

- It is responsible for starting our initial services for the first time, adding them to the central application registry and stopping the services.
- The consumer for the platform initializer is listening on the Kafka topic `Bootstrapper`. It receives messages from application manager to `start platform` and `stop platform`.
- Its producer sends messages to the topic `first_topic`. It responses to the two kind of messages that it receives (`start platform` and `stop platform)`. The response is YES or NO along with other details depending upon whether the start/stop operation passed or failed.
- The API’s exposed from this module are -

  ```python
  @app.route("/home", methods=['GET'])
  @cross_origin()
  def home():
      return "Hi, this is Platform Initializer"

  @app.route("/health", methods=['GET'])
  @cross_origin()
  def health():
      return "Ok"

  # DOUBT - Why is this used when we are using Kafka to call schedule_and_upload_to_VM()?
  @app.route("/start", methods=["GET"])
  @cross_origin()
  def start():
      print("Initializing the platform.......")
      return schedule_and_upload_to_VM()

  # DOUBT - Why is this used when we are using Kafka ?
  @app.route("/stop", methods=["GET"])
  @cross_origin()
  def stop():
      print("Stopping the platform.......")
      return stop_service_in_VM()

  # DOUBT - What does this do?
  @app.route("/status", methods=["GET"])
  @cross_origin()
  def status():
      with open('platform_status.json', 'r') as f:
          conn_json = json.load(f)
      return conn_json

  # DOUBT - When is this used?
  @app.route("/all_services", methods=["GET"])
  @cross_origin()
  def all_services():
      register_service("load_balancer", "20.21.102.175", "8050")
      res = get_all_service_registry()
      print(res)
      return res
  ```

## Starting the services

- The toggle button in the UI sends a message ‘start server’ to this flask server. Upon receiving this message, the method `schedule_and_upload_toVM()` gets called.
<!-- - DOUBT - क्या हर application जो user deploy करेगा उसका भी मेसिज यहीं आएगा?
  - No. This is done by deployment manager. -->

### `**schedule_and_upload_toVM**`

- The method gets details about all the services from `services.json` . This JSON contains an array of the following dictionaries -
  ```java
  {
          "folder_name": "ApplicationManager",
          "service_name": "application_manager",
          "docker_file_name": "application_manager_docker_file",
          "image_file_name": "application_manager_img",
          "container_name": "application_manager_container",
          "service_start_shell_file": "application_manager_start.sh",
          "service_end_shell_file": "application_manager_end.sh",
          "host_port": "8010",
          "container_port": "8050",
          "host_src_path": "../ApplicationManager"
      }
  ```
- It gets the details about the VMs from `vm-details.json`.
  ```java
  {
          "vm_name": "VM2",
          "vm_ip": "20.173.88.38",
          "vm_username": "azureuser",
          "vm_key_path": "../VM-keys/VM2_key.cer",
          "vm_service_path": "/home/azureuser/Services"
      }
  ```
- Then it runs a loop to deploy all these services into VMs in round robin fashion.
  ![Untitled](IAS%209468495f625f4376b44f4d97a8e4d3eb/Untitled.png)

********\*\*\*\*********\*\*\*\*********\*\*\*\*********\*\*********\*\*\*\*********\*\*\*\*********\*\*\*\*********PROCESS OF DEPLOYMENT TO THE VIRTUAL MACHINES********\*\*\*\*********\*\*\*\*********\*\*\*\*********\*\*********\*\*\*\*********\*\*\*\*********\*\*\*\*********

- It creates many files for a service. These are as follows →

  - A docker file to create the docker image for the application.
    ```python
    def docker_file_raw_text():
        docker_code = f"""
            FROM python:3.10
            ADD . .
            RUN pip3 install -r requirements.txt
            CMD python3 -u ./main.py
            """
        return docker_code
    ```
  - A shell script to start the service.

    ```python
    def service_start_raw_text(app_name, docker_file_name, image_name, container_name, host_port, container_port):
        service_start_shell_script = f'''
            docker stop {container_name}
            docker rm {container_name}
            docker build -f {docker_file_name} -t {image_name} .
            docker container run -v /home/azureuser/logs:/logs -d --name {container_name} -p {host_port}:{container_port} {image_name}
        '''

        return service_start_shell_script
    ```

  - A shell script to stop the service.

    ```python
    def service_end_raw_text(docker_file_name, image_name, container_name, host_port, container_port):
        service_end_shell_script = f'''
            docker stop {container_name}
            docker rm {container_name}
        '''

        return service_end_shell_script
    ```

  - A `requirements.txt file`
    ```java
    req_file = "pip freeze > requirements.txt"
    ```

- It then copies all these files to the virtual machine.
  - The local files are created in a folder with same name as the name of the service. For example, for ApplicationManager module, a folder on the local with name same name will be created. This folder contains the shell scripts, docker file and requirements.txt file.
  - The destination folder in every VM follows this directory structure `"vm_service_path": "/home/azureuser/Services"` (see `vm-details.json`).
- After copying, it runs the shell file responsible for starting the service.
  ```python
  ssh_connect_command = f"""
                  ssh -o StrictHostKeyChecking=no -i {vm['vm_key_path']} {vm['vm_username']}@{vm['vm_ip']} cd Services && cd {service['folder_name']} && sudo bash ./{service['service_start_shell_file']}
                  """
  ```
  - This start shell file does the following -
    - First it stops any container running with the same name.
    - Then it builds a docker image for this service using the docker file that was created.
    - Then it runs a container (the first container) of this service.
- After this, the container is running on the VM. Now I create a meta data of the application being deployed and send that to load balancer so that load balancer can register the deployed app with itself. Here are the details sent to the load balancer -
  ```python
  params = {'appName': service['folder_name'], 'imageName': str(service['folder_name']).lower() + "_image", 'vmIp': vm['vm_ip'],
                        'hostPort': service['host_port'], 'containerPort': service['container_port'], 'containerId': container_id}
  res = requests.get("http://20.21.102.175:8050/registerApp", params=params)
  ```
- After sending this, platform initializer receives a response from the load balancer with the end point of the module that was deployed. This is saved and then used to register the service.
  ```python
  ip = res.text.split(":")[0]
  port = res.text.split(":")[1]
  register_service(service["service_name"], ip, port)
  ```

## Service registry

### `register_service()`

- The `register_service` method registers this service with the zookeeper.
  <!-- - DOUBT - WHAT DOES THIS MEAN. MATLAB EK RECORD HOGA ZOOKEEPER ME KI KYA KYA REGISTERED HAI WHICH CAN BE ACCESSED FROM ITS SHELL? How do you access this registry and what kind of information do you get from it? -->
- This acts as a central register for our application. That JSON with the load balancer is for its internal purpose. It is not the central registry.

## Stopping the applications

- When it receives a message with `stop platform`, it calls `stop_service_in_VM` to stop these services.
- This simply goes into the directory inside the VM where that service is running (the folder that was created during deployment) and runs the end-service shell script.
- It then unregisters the service from the zookeeper.
<!-- - DOUBT - Why does not it calls `deregisterApp()` of load balancer? Or I missed it?
- DOUBT - Is it also responsible for stopping the user application? - नो -->

## Other details about platform initializer

- How are we ensuring that a producer does not sends the same message twice and a consumer does not consumes a same message twice.
  - Append each message with a unique random id.
  - The id stays constant for the message when it travels from one module to the other (platform initializer → deployment manager → some other module → … → back to platform initializer).
  - We check this list before consuming a message. If ID is already present in this, do nothing.
  <!-- - DOUBT - But why did we had multiple lists, and that too some for producers and some for consumers? We could have kept a single global list. -->

# Application Manager

- The `ApplicationManager` provides an interface to interact with the platform.
- The frontend of the platform interacts directly with the application manager which further relays the requests to the other services.
- It allows application developers to upload the compressed file of the application which the end user can deploy based on their requirements.
- The uploaded app is saved within the `baseApps` container of Azure Blob Storage.
- If an end user requests for any app to be deployed, then a instance of that app is pulled from the `baseApps` and populated with all the config information and uploaded to the `deployedApps` container on Azure Blob Storage.
- After this, the `ApplicationManager` sends a message to the `DeployementManager` asking for that particular app to be deployed and the `DeploymentManager` then deploys it and sends the URL of the deployedApp back to the `ApplicationManager`.
- The `ApplicationManager` then sends this URL to the user who can access his deployedApp with this URL.
- APIs exposed from this module were -
  ```python
  def create_baseapp_routes(api: Api):
    """Adds resources to the api.
    :param api: Flask-RESTful Api Object
    """
    # Get request
    api.add_resource(GetAppsApi, "/api/baseApp/getapps/")
    # Post request
    api.add_resource(AppUploadApi, "/api/baseApp/upload/")
    # Post request
    api.add_resource(CheckFileName, "/api/baseApp/checkfilename/")
  ```
  ```python
  def create_deployedapp_routes(api: Api):
    """Adds resources to the api.
    :param api: Flask-RESTful Api Object
    """
    # Get request
    api.add_resource(GetDeployedAppsApi, "/api/deployedApps/getDeployedApps/")
    # Get request
    api.add_resource(GetScheduledAppsApi, "/api/deployedApps/getScheduledApps/")
    # Get request
    api.add_resource(GetDeployedInProgressApi, "/api/deployedApps/getDeployInProgressApps/")
    # Post request
    api.add_resource(DeployApp, "/api/deployedApps/deployApp/")
    #Post request
    api.add_resource(ScheduleApp, "/api/deployedApps/scheduleApp/")
    api.add_resource(StopDeployedApp, "/api/deployedApps/stopApp/")
  ```

# Deployment manager

- This is responsible for deployment of the applications (not our modules like NodeManager, etc), and de-registration of these applications.
- At this time all the services are up on the VM. Now this module will go into action when it receives a message for register or de-registering an app.
- The consumer for the deployment manager is listening on the topic `DeploymentManager`. It will receive messages from `ApplicationManager`, `NodeManager` on this topic.
  - `NodeManager` → The response from node manager containing the healthiest node for application deployment.
  - `ApplicationManager` →The message from application manager to deploy and stop an app.
- It sends messages to topics `NodeManager` and `first_topic`.
  - `NodeManager` → To ask for best node.
  - `first_topic` -
    - Sends end point of the deployed application if successful, else error message.
    - Sends confirmation message to this topic when it stops an application, or error message, if it fails to stop.
- APIs exposed from this module were -

  ```java
  @app.route("/home", methods=['GET'])
  @cross_origin()
  def home():
      return "Hi, this is DeploymentManager"

  @app.route("/health", methods=['GET'])
  @cross_origin()
  def health():
      return "Ok"

  @app.route("/get_logs", methods=['GET'])
  @cross_origin()
  def get_logs():
      logs = ""
      with open("/logs/depmgr_logs.log", "r") as log_file:
          for line in (log_file.readlines()[-10:]):
              logs += line

      print(logs)
      return {"logs": logs}
  ```

## Registration of an application

- When it receives a message from application manager with `deploy app` written in it, it extracts the application name from the message and sends a message to the topic `NodeManager`. The node manage has a consumer which is listening to this topic.
  ```python
  if "deploy app" in request_data['msg']:
              app_name = request_data['msg'].split("$")[1]
              msg = {
                  'to_topic': 'NodeManager',
                  'from_topic': 'DeploymentManager',
                  'request_id': request_data['request_id'],
                  'msg': f'give best node${app_name}'
              }
  ```
- The node manager upon receiving such message finds the best node for this particular app. It sends the best node information to the topic `DeploymentManager` with message content containing the keyword `ans-node`.
  ```python
  # Code from Node manager's consumer_request method
  if "give best node" in request_data['msg']:
              app_name = request_data['msg'].split("$")[1]
              res = get_node_health()
              res["app_name"] = app_name
              msg = {
                  'to_topic': 'DeploymentManager',
                  'from_topic': 'NodeManager',
                  'request_id': request_data['request_id'],
                  'msg': f"ans-node${str(res)}"
              }
  ```
- The consumer inside the `DeploymentManager` is reading this topic and when it finds this keyword in the topic, it extracts the vm details from this message. This is the reason that deployment manager had to send app’s name initially because it is being used now.
  ```python
  if "ans-node" in request_data['msg']:
              res = json.loads(request_data['msg'].split("$")[1].replace('\'', '"'))
              ip_deploy = res["node_ip"]
              port_deploy = res["port"]
              app_name = res["app_name"]
              node_name = res["node_name"]
              print(ip_deploy, port_deploy, app_name, node_name)
  ```
- Now it knows that application name and complete details like ip, port, VM name, etc of the machine where this application has to be deployed. Similar to the way platform deployed the services (creating docker file, shell scripts etc), the deployment manager deploys the application and obtains the container id. `container_id = deploy_app(node_name, ip_deploy, port_deploy, app_name)`.
  - After deploying the app and obtaining the container id, it also calls `register_app()` method which adds this app registry to the zookeeper.
- In the next step, it calls the `/registerApp` api of the load balancer exactly like platform initializer and registers the apps with the load balancer and obtains the end point of the application.
- Then it sends the end point back to the `first_topic` in case the deployment was successful. If not, it sends error message to `first topic`. The message, in both the cases, contains all the app and vm details to be worked upon later.

## Stopping an application

- The deployment manager receives a message from application manager to stop the application → `stop app`. It receives the app name from the message.
- It first calls `/deregisterApp` of the load balancer. The load balancer removes all the container of this specific app.
  <!-- - DOUBT - the problem is that how will the services from the platform initializer get unregistered. Because that did not call this API. -->
- Depending upon whether the de-registering process was successful or not, it sends message to `first_topic`.
  ```python
  msg = {
                      'to_topic': 'first_topic',
                      'from_topic': 'DeploymentManager',
                      'request_id': request_data['request_id'],
                      'msg': f'done stopped${app_name}'
                  }
  ```
- It then calls `unregister_app(app_name)` method which deregisters this application from zookeeper.

# Node Manager

- The node manager is responsible for providing healthiest VM to the deployment manager upon receiving a message from it.
- The consumer inside this module listens over the topic `NodeManager`. It only receives messages from deployment manager. The only type of message it receives contains the keyword `give best node` indicating that deployment manager is asking for the healthiest VM at that point of time.
- It has a single producer which sends message to the topic `DeploymentManager`. This is the only topic node manager sends message to. The message contains the best VM details for the app_name.
  ```python
  if "give best node" in request_data['msg']:
              app_name = request_data['msg'].split("$")[1]
              res = get_node_health()
              res["app_name"] = app_name
              msg = {
                  'to_topic': 'DeploymentManager',
                  'from_topic': 'NodeManager',
                  'request_id': request_data['request_id'],
                  'msg': f"ans-node${str(res)}"
              }
              send(request_data, msg, requests_m1_c, requests_m1_p)
  ```
- API’s exposed from this module are -

<!-- # DOUBT - ये क्या कर रहा है और कौन इसे कोल कर रहा है? -->
  ```python
  
  @app.route("/nodemgr/get-deploy-node", methods=['GET'])
  @cross_origin()
  def get_deploy_node():
      res = get_node_health()
      return flask.jsonify(res)

  @app.route("/nodemgr/get-all-nodes-health", methods=['GET'])
  @cross_origin()
  def get_all_nodes_health1():
      res = get_all_nodes_health()
      return flask.jsonify(res)

  @app.route("/nodemgr/log", methods=['GET'])
  @cross_origin()
  def get_log():
      monitor_nodes()
      pass

  @app.route("/nodemgr/delete-old-logs", methods=['DELETE'])
  @cross_origin()
  def delete_old_logs():
      delete_logs()
      return "Success"

  @app.route("/home", methods=['GET'])
  @cross_origin()
  def home():
      return "Hi, this is NodeManager"

  @app.route("/health", methods=['GET'])
  @cross_origin()
  def health():
      logger.info("Health Checked")
      return "Ok"

  @app.route("/get_logs", methods=['GET'])
  @cross_origin()
  def get_logs():
      logs = ""
      with open("/logs/nodemgr_logs.log", "r") as log_file:
          for line in (log_file.readlines()[-10:]):
              logs += line

      print(logs)
      return {"logs": logs}
  ```

  <!-- - DOUBT - What is the use of this api `@app.route("/nodemgr/get-deploy-node", methods=['GET'])`
  - DOUBT - Are these api’s called from the UI to display information? -->
  - The platform initializer boots up all the services of the application by spinning their containers onto VMs. The deployment manager deploys the first instance of every user application by spinning a container on the healthiest VM. Both of these modules get endpoint for their deployments from load balancer.
  - The load balancer constantly keeps monitoring CPU and RAM usage of every container that exists on any VM. If the containers are unhealthy, a replica of the container gets created on the same VM.

  ## Communication with other modules

  - Unlike other modules, we don’t use Kafka here. The platform initializer and deployment manager send request to register and deregister an application via REST API.
  - The reason for this is that load balancer internally maintains various JSONs which contain critical information like available ports, etc. We wanted that all register calls to the load balancer should be synchronous, ie, blocking in nature. This ensured that the load balancer does not receives multiple registrations and de-registrations requests simultaneously. This avoided any race condition and situations like two applications getting same end-points.

# Load balancer

## Registration of application

- To registration an application, the following information information should be sent to the load balancer through a `GET` request which will then be passed to the `registerApp()` method inside the `LoadBalancer` class. Load balancer then registers the original instance of the app by updating its JSONs and returns the end point of the application.
  - `vmIp`: The ip of the vm on which the app has been deployed
  - `containerId`: ID of the container in which original instance of the app is running
  - `appName`: Name of the application. This will also be the name of .conf file in `/etc/nginx/conf.d`
  - `imageName`: The name of the image which was used in docker run command to make the container for the app
  - `containerPort`: The port on which the app is listening inside the container
  - `hostPort`: The port of the host VM
  - `lbVmName`: This is the name of VM on which load balancer is running
- It maintains few JSONs which are listed below -

  - `VmDetails.json`
    ```json
    [
      {
        "vm_name": "VM1",
        "vm_ip": "20.21.102.175",
        "vm_username": "azureuser",
        "vm_key_path": "./VM-keys/VM1_key.cer",
        "vm_service_path": "/home/azureuser/LoadBalancerTesting",
        "latestAvailablePort": 49152,
        "hosted_apps": []
      }
    ]
    ```
  - `AppDetails.json`

    ```json
    [
    		{
                "appName": appName,
                "imageName": imageName,
                "hostVm": hostVm,
                "instances": 1,
                "containerPort": containerPort,
                "hostPorts": [hostPort],
                "nginxPort": 0,
                "containerIds": [containerId]
        },

    }
    ```

  - `AppHealth.json`

    ```json
    [
    	{
    			"appName" : appName,
    			"stats" : ["container - containerId is healthy/unhealthy; RAM utilizatoin = x% ; CPU utilization = y%"]
    	},

    ]
    ```

    - This JSON will be populated when the load balancer does its routing monitoring cycle.

  - `NginxPort.json`
    ```python
    [
        {
            "id": "default",
            "latestAvailablePort": 2000
        }
    ]
    ```
    - This JSON contains the latest available port which can be allocated as the port in the end point of the incoming application registration request.
    - When the application registration with the load balancer is complete, this port number gets updated with another free port for the next application registration request.

- The first step towards the registration process is fetching the complete details of the VM on which the first instance of the application has been deployed. This is done by loading the dictionary from `VmDetails.json` whose `vm_ip` matches with one that came from the GET request. It then creates a temporary dictionary and appends it to `AppDetails.json` which contains information about all the apps and services that are registered with the load balancer.

  ```python
  vm = LoadBalancer.__getDictFromJson__("VmDetails.json", 'vm_ip', vmIp)
          hostVm = vm['vm_name']
          newApp = {
              "appName": appName,
              "imageName": imageName,
              "hostVm": hostVm,
              "instances": 1,
              "containerPort": containerPort,
              "hostPorts": [hostPort],
              "nginxPort": 0,
              "containerIds": [containerId]
          }
  with open("./AppDetails.json") as file:
      apps = json.load(file)

  apps.append(newApp)

  with open("AppDetails.json", 'w') as json_file:
      json.dump(apps, json_file, indent=4)
  ```

  - By this step, we have a basic entry in the deployed app in the load balancer’s list of maintained applications. This entry needs to be updated later as `nginxPort` is set to `0`.

- The `VmDetails.json` contains a list which contains the name of all the applications that is hosted on it. This file is also updated by appending the currently deployed app’s name to this list. `LoadBalancer.__updateJson__("VmDetails.json", "vm_name", hostVm, "hosted_apps", appName, "append")`
- The next step is creating NGINX configuration file for this app on the VM where the load balancer is running. The load balancer is running on the VM whose name is `lbBmName` and using the method `LoadBalancer.__addNginxConfigFile__(appName, lbVmName)`, a configuration file for this application is created on that VM.

### Creation of NGINX configuration file - `LoadBalancer.__addNginxConfigFile__(appName, lbVmName)`

- A typical NGINX configuration file looks like this -

  ```
  upstream appName_servers {
      server 127.0.0.1:7201;
      server 127.0.0.1:7202;
      server 127.0.0.1:7203;
  }

  server {
      listen 0.0.0.0:2000;

      location / {
          proxy_pass http://appName_servers/;
      }
  }
  ```

  - This means that when NGINX receives a request on all network interfaces (0.0.0.0) on port 2000, it will redirect the request to a set of upstreams defined under the name `http://appName_servers`.
  - In our case the IP:PORT defined in the upstreams are the addresses of actual containers deployed on some VMs inside which the flask server for our application or services are running.
  - Therefore the end point of any service or application can be the `http://lbVmIP:2000`.
    - When a request comes at ip of the VM on which load balancer is running and the port number is 2000, the request will be redirected to addresses of the app containers defined as upstreams.

- Whenever the load balancer has to register a new app, it has to create a NGINX config file for it. This config file gets created in `/etc/nginx/conf.d` directory of the VM on which load balancer is running. The name of this config file will be `appName.conf`.
- The first step in this process is getting the `app` and the `appHostVm` details from `AppDetails.json` and `VmDetails.json`.
  ```python
  app, appHostVm = LoadBalancer.__getAppAndVmDetails__(appName)
  ```
- Next it needs to prepare the content that has to be written in the configuration file for this application.

  ```python
  configData = f"""
  upstream {app["appName"]}_servers{{
      #server 20.173.88.38:7200;
      server {appHostVm["vm_ip"]}:{app["hostPorts"][0]};
  }}

  server {{
      listen 0.0.0.0:{nginxport[0]["latestAvailablePort"]};
      location / {{
          proxy_pass http://{app["appName"]}_servers/;
      }}
  }}

  """
  ```

  - The IP address of the VM on which the deployment manager deployed the first container of this application is found using `appHostVm["vm_ip"]`.
  - The port number of this first instance is the first element in the list of port numbers maintained in the dictionary corresponding to this app, present in `AppDetails.json`. This is extracted using `app["hostPorts"][0]`.
  - Using the above two information, we get the first IP:PORT of the first instance of the application. Now this is added as the first upstream for this application in the config file.
  - The port for the end point of this application is obtained from `NginxPort.json` using `nginxport[0]["latestAvailablePort"]`

- Now, we have the data ready to be written in the config file of this application. In the directory `/etc/nginx/conf.d`, we create a file `appName.conf` and write the above content to it.
- Once the file is created, we update the JSONs maintained with the load balancer as follows →
  - `AppDetails.json` → Initially, its key `"nginxPort"` was set to `0`. Now since we have the `nginxPort`, we update it to `nginxport[0]["latestAvailablePort"]`.
    ```python
    LoadBalancer.__updateJson__("AppDetails.json", "appName", appName, "nginxPort",
                                        nginxport[0]["latestAvailablePort"])
    ```
  - `NginxPort.json` → Next this file has to be updated with another port which can be used for registration request for some another application. This is done as follows -
    ```python
    LoadBalancer.__updateJson__("NginxPort.json", "id", "default", "latestAvailablePort",
                                        nginxport[0]["latestAvailablePort"] + 1)
    ```

Now the method `__addNginxConfigFile__(appName: str, lbVmName: str)`is completed and the call returns back to `registerApp()` method.

Finally we have the end point of the application which is `http://IP_OF_LbVm:NginxPort_OF_APP`. This end point is returned back

```python
return f'{lbVm["vm_ip"]}:{appUpdatedDict["nginxPort"]}'
```

## Balance cycles

After every 100 milliseconds, the load balancer performs one balance cycle. This is done in a separate thread which keeps running in parallel and runs the `balance()` method of LoadBalancer. The details about a cycle is given below.

- The file `AppHealth.json` contains health statistics about every app and all its containers collected during one cycle of balancing. The first step is to empty this file to delete the old statistics and populate it with the new stats that will be collected during this cycle of balancing.
  ```python
  LoadBalancer.__updateJson__('AppHealth.json', None, None, None, None, 'empty')
  ```
- It then loads all the details of app present in `AppDetails.json`. Then goes into a loop for each app, and performs the following -
  - It obtains the list of all the container ids from the key-value pair `"containerIds": [containerId]`present in the dictionary for this app. It loops over all container ids and gets their RAM and CPU usage using two helper methods.
    ```python
    ramUsage = LoadBalancer.__getContainerRamUsage__(appHostVm, container)
    cpuUsage = LoadBalancer.__getContainerCpuUsage__(appHostVm, container)
    ```
  - If ram usage is less than 75 and CPU usage is less than 80, the container is considered healthy. This stats about this container is appended to this app’s dictionary present in `AppHealth.json`.
  - If ram usage is more than 75 or cpu usage is more than 80, the container is considered unhealthy. Therefore a replica of this container is to be created. This replica is created on the same VM where the original replica is present.
    ```python
    LoadBalancer.addReplica(app["appName"], lbVmName)
    ```

### How the replica gets created → `addReplica(appName: str, lbVmName: str)`

- The first step is to get all the details about the app whose container has to be replicated (like image name, container port, etc which will be required for spinning a new container) and the details of the VM on which this app is hosted.
  ```python
  app, appHostVm = LoadBalancer.__getAppAndVmDetails__(appName)
  ```
- In the next step, we connect to this VM, and execute a `docker run` command to spin a new container. The container port of the application, ie, the port on which the flask server of the app is listening (`app["containerPort"]`) and image name of the application which was created on the VM during deployment (`app["imageName"]`) is already known from the dictionary fetched from `AppDetails.json`.
- **\*\*\*\***\*\***\*\*\*\***Naming convention for replica containers →**\*\*\*\***\*\***\*\*\*\*** The dictionary for this app contains a key `instances` which stores the number of replicas this app currently has. When the app is deployed for the first time, `instances = 1`. The replica container that will be created will have its name like ‘appName*instance*<instance number>’ , (from code → `{appName}_instance_{app["instances"] + 1}`).
- ******\*\*******\*\*******\*\*******\*\*******\*\*******\*\*******\*\*******Host port of the container →******\*\*******\*\*******\*\*******\*\*******\*\*******\*\*******\*\******* Every application’s container’s port is mapped to some port of the VM. The container port for all the application’s container is fixed and can be found from `"containerPort": containerPort` key-value pair present in the app’s dictionary inside `AppDetails.json`. But the host port of the container is not fixed. With every new deployment, we need to provide a free port on the VM which will be mapped to the container port. This is done as follows →
  - `VmDetails.json` has a dictionary for every VM. Each dictionary contains a key `"latestAvailablePort"` which contains the port number of a free port which can be mapped to a container, when a new container has to be created.
  - While creating a container, this free port is fetched from this dictionary (from code →`appHostVm["latestAvailablePort"]`) and is used inside the docker run command.
    ```python
    commandDocker = f"""sudo docker run --name {appName}_instance_{app["instances"] + 1} -d -p {appHostVm["latestAvailablePort"]}:{app["containerPort"]} {app["imageName"]} && sudo docker ps -l -q """
    ```
- After the replica container gets created on the VM, we also need to update the NGINX configuration file for that application. In the list of upstreams defined for this application, we just need to add the address of the newly created container. This is done by `LoadBalancer.__updateNginxConfig__(appName: str, lbVmName: str, hostPort: int)`method.
  - Note that every app has its config file inside `/etc/nginx/conf.d/appName.conf`.
- After the replica container has been successfully deployed over the VM and its NGINX config file has been updated, the following updates happen in the JSONs -
  - increment the instances of the app by 1 → `LoadBalancer.__updateJson__('AppDetails.json', "appName", appName, "instances", app["instances"] + 1)`
  - add the container id of the replica just created to the list of containers maintained for the application → `LoadBalancer.__updateJson__('AppDetails.json', "appName", appName, "containerIds", replicaContId, "append")`
  - append the host port to the list of host ports maintained in app dictionary from `AppDetails.json` → `LoadBalancer.**updateJson**('AppDetails.json', "appName", appName, "hostPorts", appHostVm["latestAvailablePort"], "append")`
  - update the latest available port for that VM in `VmDetails.json` → `LoadBalancer.**updateJson**('VmDetails.json', "vm_name", appHostVm["vm_name"], "latestAvailablePort", appHostVm["latestAvailablePort"] + 1)`

# De-registration of application

- For de-registering an application, it has to be given the application name as a parameter via GET request to the endpoint `/deregisterApp`. It then calls `deregisterApp()` method present inside the `LoadBalancer` class.
- From `AppDetails.json`and `VmDetails.json`, we fetch all the container ids of the application and the ip and port of the machine on which the app is deployed.
- Then a connection is established with this VM and docker commands are executed which stops the running containers of the application, removes them and then deletes the docker image of the application from the VM.
- In the next step, the NGINX configuration file for this also deleted using the method `__removeNginxEntry(appName, lbVmName: str)`.

# Common endpoints exposed from every module

Every module has the following APIs

```python

@app.route("/home", methods=['GET'])
@cross_origin()
def home():
    return "Hi, this is NodeManager"

@app.route("/health", methods=['GET'])
@cross_origin()
def health():
    logger.info("Health Checked")
    return "Ok"

@app.route("/get_logs", methods=['GET'])
@cross_origin()
def get_logs():
    logs = ""
    with open("/logs/nodemgr_logs.log", "r") as log_file:
        for line in (log_file.readlines()[-10:]):
            logs += line

    print(logs)
    return {"logs": logs}
```

<!-- # To do

- Understand every exposed API, and who calls it.
-

# Doubts

DOUBT - why are we maintaining so many lists, are there multiple producers and consumers? `global requests_m1_c, requests_m1_p, requests_m2_c, requests_m2_p, requests_m3_c, requests_m3_p` और ये हर module में है।

DOUBT - How many producers and consumers were there inside each module? - I think only one because you are using name of the topic to identify where the message came from instead of using consumer id. (FROM topic identifies the consumer).

DOUBT - Sensor manager and blob storage वाली चीज़ समझनी है।

DOUBT - Logging कैसे कर रहे थे?

DOUBT - Who consumes data from first topic. भेज तो सब रहे हैं, साला खा कौन रहा है?

# Miscellaneous

- Entire app introduction, working, etc, program flow, databases

# Interview questions

- -->
