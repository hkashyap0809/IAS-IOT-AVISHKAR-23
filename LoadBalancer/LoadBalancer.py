import os
import json
import subprocess
import re
import time
import requests


class LoadBalancer:

    @staticmethod
    def __getAppAndVmDetails__(appName: str):
        with open('AppDetails.json') as json_file:
            apps = json.load(json_file)
        appDict, vmDict = None, None
        for app in apps:
            if app["appName"] == appName:
                appDict = app
                break
        with open('VmDetails.json') as json_file:
            vms = json.load(json_file)

        for vm in vms:
            if vm["vm_name"] == appDict["hostVm"]:
                vmDict = vm
                break

        return appDict, vmDict

    @staticmethod
    def __getDictFromJson__(filename: str, keyId: str, valId: str):
        with open(filename) as json_file:
            dicts = json.load(json_file)

        for d in dicts:
            if d[keyId] == valId:
                return d

    @staticmethod
    def __updateJson__(fileName, keyId, valId, updateKey, newVal, method="overwrite"):
        """
        LoadBalancer.__updateJson__("AppDetails.json", "appName", appName, "instances", instances + 1)
        In AppDetails.json where appName == appName, update key instances value to (instances + 1)
        """
        with open(fileName) as json_file:
            dicts = json.load(json_file)

        for d in dicts:
            if d[keyId] == valId:
                if method == "overwrite":
                    d[updateKey] = newVal
                    break
                elif method == "append":
                    d[updateKey].append(newVal)
                elif method == "addKey":
                    d[updateKey] = newVal
                else:
                    raise Exception("invalid update method provided in updateJson!")
                break

        with open(fileName, 'w') as json_file:
            json.dump(dicts, json_file, indent=4)

    @staticmethod
    def addReplica(appName: str, lbVmName: str):
        """
         Go to the VM on which app is hosted
         Create container for that app, add the container id in AppDetails.json
         Update the config file for the app in lbVm
         :param appName: Name of the app whose replica is to be created
         :param lbVmName: Name of VM on which load balancer is running
         :return:
         """

        app, appHostVm = LoadBalancer.__getAppAndVmDetails__(appName)

        commandDocker = f"""sudo docker run --name {appName}_instance_{app["instances"] + 1} -d -p {appHostVm["latestAvailablePort"]}:{app["containerPort"]} {app["imageName"]} && sudo docker ps -l -q """
        commandConnect = f"""ssh -i {appHostVm["vm_key_path"]} {appHostVm["vm_username"]}@{appHostVm["vm_ip"]} """

        result = subprocess.run(
            f"""{commandConnect} {commandDocker} """.split(),
            stdout=subprocess.PIPE)

        output = result.stdout.decode('utf-8')
        replicaContId = output.split()[1]

        LoadBalancer.__updateNginxConfig__(appName, lbVmName, appHostVm["latestAvailablePort"])

        LoadBalancer.__updateJson__('AppDetails.json', "appName", appName, "instances", app["instances"] + 1)
        LoadBalancer.__updateJson__('AppDetails.json', "appName", appName, "containerIds", replicaContId, "append")
        LoadBalancer.__updateJson__('AppDetails.json', "appName", appName, "hostPorts",
                                    appHostVm["latestAvailablePort"],
                                    "append")
        LoadBalancer.__updateJson__('VmDetails.json', "vm_name", appHostVm["vm_name"], "latestAvailablePort",
                                    appHostVm["latestAvailablePort"] + 1)
        print(f"Replica of {appName} created!")

    @staticmethod
    def __updateNginxConfig__(appName: str, lbVmName: str, hostPort: int):
        """
        The method assumes that the confing file in /etc/nginx/conf.d of the lbVm and is named as appName.conf
        Go to the config file location and read the file into a string
        Append server hostVmIp:hostPort; in upstream part of the string
        delete the config file on the server
        Create the config file on the server with the same name and updated contents
        :param appName: Name of the app whose replica has been created
        :param lbVmName: Name of VM on which load balancer is running
        :param hostPort: Port of the VM on which the replica was just created
        """

        # Note that I am reading a file which will be updated immediately after this method gets executed
        app, appHostVm = LoadBalancer.__getAppAndVmDetails__(appName)
        lbVm = LoadBalancer.__getDictFromJson__('VmDetails.json', "vm_name", lbVmName)

        commandConnect = f'''ssh -i {lbVm["vm_key_path"]} {lbVm["vm_username"]}@{lbVm["vm_ip"]}'''
        commandReadConfig = f'''cd /etc/nginx/conf.d && cat {appName}.conf'''

        result = subprocess.run(f'{commandConnect} {commandReadConfig}'.split(), stdout=subprocess.PIPE)
        configData = result.stdout.decode('utf-8')
        upstreamEndIndex = configData.find('}')
        updatedConfigData = f'''{configData[:upstreamEndIndex]}\n    server {appHostVm["vm_ip"]}:{hostPort};\n{configData[upstreamEndIndex:]} '''

        commandEmptyConfig = f'''cd /etc/nginx/conf.d && sudo rm {appName}.conf && sudo touch {appName}.conf'''
        commandUpdateConfig = f"""
cd /etc/nginx/conf.d
sudo touch {appName}.conf
sudo tee {appName}.conf > /dev/null << EOF
{updatedConfigData} 
EOF
sudo nginx -s reload

        """
        os.system(f'''{commandConnect} "{commandEmptyConfig}; {commandUpdateConfig}"''')
        print(f"Added replica to config file of {appName}.config")

    @staticmethod
    def registerApp(appName: str, imageName: str, hostVm: str, containerPort: int, hostPort: int, containerId: str,
                    lbVmName: str):
        """
        When deployment manager deploys the app, it should send the above information to the load balancer.
        Load balance will then register the original instance of the app by updating its jsons
        :param containerId: ID of the container in which original instance of the app is running
        :param appName: Name of the application. This will also be the name of .conf file in /etc/nginx/conf.d
        :param imageName: The name of the image which was used in docker run command to make the container for the app
        :param hostVm: Name as per VmDetails.json
        :param containerPort: The port on which the app is listening inside the container
        :param hostPort: The port of the host VM
        :param lbVmName: This is the name of VM on which load balancer is running
        :return: None
        """
        with open("./AppDetails.json") as file:
            apps = json.load(file)

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

        apps.append(newApp)

        with open("AppDetails.json", 'w') as json_file:
            json.dump(apps, json_file, indent=4)

        # Add this app in hosted_apps in VmDetails.json
        LoadBalancer.__updateJson__("VmDetails.json", "vm_name", hostVm, "hosted_apps", appName, "append")

        # make a config file in nginx conf.d
        LoadBalancer.__addNginxConfigFile__(appName, lbVmName)

        print(f"Successfully registered {appName}")
        lbVm = LoadBalancer.__getDictFromJson__('VmDetails.json', "vm_name", lbVmName)
        appUpdatedDict = LoadBalancer.__getDictFromJson__("AppDetails.json", "appName", appName)
        LoadBalancer.__updateJson__('AppDetails.json', "appName", appName, "endpoint",
                                    f'http://{lbVm["vm_ip"]}:{appUpdatedDict["nginxPort"]}', 'addKey')

        print(f'Endpoint of {appName} -> http://{lbVm["vm_ip"]}:{appUpdatedDict["nginxPort"]}')
        return f'{lbVm["vm_ip"]}:{appUpdatedDict["nginxPort"]}'

    @staticmethod
    def __addNginxConfigFile__(appName: str, lbVmName: str):
        """
        This method creates a appName.conf file in /etc/nginx/conf.d
        :param appName: Name of app which was registered
        """

        app, appHostVm = LoadBalancer.__getAppAndVmDetails__(appName)
        lbVm = LoadBalancer.__getDictFromJson__('VmDetails.json', "vm_name", lbVmName)

        with open('NginxPort.json') as json_file:
            nginxport = json.load(json_file)

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
        createConfig = f"""
ssh -i {lbVm["vm_key_path"]} {lbVm["vm_username"]}@{lbVm["vm_ip"]} "
cd /etc/nginx/conf.d
sudo touch {appName}.conf
sudo tee {appName}.conf > /dev/null << EOF
{configData} 
EOF
sudo nginx -s reload
"

"""
        os.system(createConfig)
        LoadBalancer.__updateJson__("AppDetails.json", "appName", appName, "nginxPort",
                                    nginxport[0]["latestAvailablePort"])
        LoadBalancer.__updateJson__("NginxPort.json", "id", "default", "latestAvailablePort",
                                    nginxport[0]["latestAvailablePort"] + 1)
        print(f"{appName}.conf created")

    @staticmethod
    def __getContainerRamUsage__(vm: dict, containerId: str):
        """
        :param vm: Dict containing complete details of the VM on which container is deployed
        :param containerId: id of the container whose RAM usage is to be found
        :return: Percentage of RAM currently under use
        """
        commandConnect = f'''ssh -i {vm["vm_key_path"]} {vm["vm_username"]}@{vm["vm_ip"]}'''
        commandDocker = f'''sudo docker container stats --no-stream {containerId} --format {{{{.MemUsage}}}}'''
        output = subprocess.check_output(f'{commandConnect} {commandDocker}'.split())
        # output.decode.strip is like "40.55MiB / 906MiB"
        # output.decode.strip.split is like ['40.55MiB ', ' 906MiB']
        currMemUsage, totMemAvail = output.decode().strip().split("/")

        currMemUsage = float(re.sub("[^0-9.]", "", currMemUsage))
        totMemAvail = float(re.sub("[^0-9.]", "", totMemAvail))
        return currMemUsage / totMemAvail * 100

    @staticmethod
    def __getContainerCpuUsage__(vm: dict, containerId: str):
        """
        :param vm: Dict containing complete details of the VM on which container is deployed
        :param containerId:  id of the container whose CPU usage is to be found
        :return: Percentage of CPU currently under use
        """

        commandConnect = f'''ssh -i {vm["vm_key_path"]} {vm["vm_username"]}@{vm["vm_ip"]}'''
        commandDocker = f'''sudo docker container stats --no-stream {containerId} --format "{{{{.CPUPerc}}}}"'''
        output = subprocess.check_output(f'{commandConnect} {commandDocker}'.split())
        cpuPercentage = re.sub("[^0-9.]", "", output.decode())
        return float(cpuPercentage)

    @staticmethod
    def __balanceOnce__(lbVmName):
        with open('AppDetails.json') as json_file:
            allApps = json.load(json_file)
        for app in allApps:
            print(f"checking load on {app['appName']}")
            appHostVm = LoadBalancer.__getDictFromJson__('VmDetails.json', 'vm_name', app["hostVm"])
            for container in app["containerIds"]:
                ramUsage = LoadBalancer.__getContainerRamUsage__(appHostVm, container)
                cpuUsage = LoadBalancer.__getContainerCpuUsage__(appHostVm, container)

                if ramUsage > 75 or cpuUsage > 80:
                    print(
                        f'{app["appName"]}, container - {container} is unhealthy; RAM utilization = {ramUsage}% ; CPU utilization = {cpuUsage}%')
                    LoadBalancer.addReplica(app["appName"], lbVmName)
                    break  # don't create a new container for every unhealthy container. Just create one. If needed
                    # create one more in the next round
                else:
                    print(
                        f'{app["appName"]}, container - {container} is healthy; RAM utilization = {ramUsage}% ; CPU utilization = {cpuUsage}%')

    @staticmethod
    def balance(lbVmName):
        breakCounter = 0
        while True:
            LoadBalancer.__balanceOnce__(lbVmName)
            breakCounter += 1
            time.sleep(10)
            if breakCounter == 3:
                break

    @staticmethod
    def __heartBeatOnce__():

        with open('AppDetails.json') as json_file:
            allApps = json.load(json_file)

        for app in allApps:
            response = requests.get(f'{app["endpoint"]}/heartbeat')
            if response.status_code == 200:
                print(f'{app["appName"]} is alive!')
                print("Success! Response body:", response.text)
            else:
                print(f'{app["appName"]} is dead!')
                print("Failed with status code:", response.status_code)
            time.sleep(5)

    @staticmethod
    def listenHeartbeat():
        temCounter = 0
        while True:
            LoadBalancer.__heartBeatOnce__()
            time.sleep(5)
            temCounter += 1
            if temCounter == 4:
                break


if __name__ == "__main__":
    lb = LoadBalancer()
    lb.registerApp("testApp1", "test_app1_image", "VM1", 7200, 30000, "180b5f7b7ca8", "VM1")
    lb.registerApp("testApp2", "test_app2_image", "VM2", 7200, 30000, "42412462b45a", "VM1")
    lb.registerApp("testApp3", "test_app3_image", "VM3", 7200, 30000, "87a09e0c621c", "VM1")
    lb.addReplica("testApp1", "VM1")  # forcefully create replica
    lb.addReplica("testApp1", "VM1")  # forcefully create replica
    lb.addReplica("testApp2", "VM1")  # forcefully create replica
    lb.addReplica("testApp2", "VM1")  # forcefully create replica
    lb.addReplica("testApp2", "VM1")  # forcefully create replica
    # lb.listenHeartbeat()  # listen heartbeat for three cycles (for now)
    lb.balance("VM1")  # balance load for three cycles (for now)
