import os
import json
import subprocess
from datetime import datetime
import requests
from flask import Flask
from flask_cors import cross_origin
from service_registry import *

app = Flask(__name__)


def create_file(path, file_name, docker_code):
    f = open(path + '/' + file_name, 'w')
    f.write(docker_code)
    f.close()


def docker_file_raw_text():
    docker_code = f"""
        FROM python:3.10
        ADD . .
        RUN pip3 install -r requirements.txt
        CMD python3 -u ./main.py
        """
    return docker_code


def service_start_raw_text(app_name, docker_file_name, image_name, container_name, host_port, container_port):
    service_start_shell_script = f'''
        docker stop {container_name}
        docker rm {container_name}
        docker build -f {docker_file_name} -t {image_name} .
        docker container run -v /home/azureuser/logs:/logs -d --name {container_name} -p {host_port}:{container_port} {image_name}
    '''

    return service_start_shell_script


def service_end_raw_text(docker_file_name, image_name, container_name, host_port, container_port):
    service_end_shell_script = f'''
        docker stop {container_name}
        docker rm {container_name}
    '''

    return service_end_shell_script


def generate_docker_file_and_service_start_shell(app_name, path, service, host_port, container_port):
    docker_file_name = service + "_docker_file"
    image_file_name = service + "_img"
    container_name = service + "_container"
    service_start_file_name = service + "_start.sh"
    service_end_file_name = service + "_end.sh"

    docker_code = docker_file_raw_text()
    create_file('./' + path, docker_file_name, docker_code)
    service_start_code = service_start_raw_text(app_name, docker_file_name, image_file_name, container_name, host_port, container_port)
    create_file('./' + path, service_start_file_name, service_start_code)
    service_end_code = service_end_raw_text(docker_file_name, image_file_name, container_name, host_port, container_port)
    create_file('./' + path, service_end_file_name, service_end_code)


def get_services():
    with open('./service-details.json', 'r') as f:
        data = json.load(f)
    return data


def get_VM_key_details():
    with open('./vm-details.json', 'r') as f:
        data = json.load(f)
    return data


def schedule_and_upload_to_VM():
    services = get_services()
    vm_keys = get_VM_key_details()

    idx = 0

    try:
        for service in services:
            vm = vm_keys[idx]

            print("Unregistering by LB")
            params = {"appName": service['folder_name']}
            res = requests.get("http://20.21.102.175:8050/deregisterApp", params=params)
            print(res.text)

            generate_docker_file_and_service_start_shell(service['folder_name'], service['host_src_path'], service['service_name'],
                                                         service['host_port'], service['container_port'])
            req_file = "pip freeze > requirements.txt"
            command = f"scp -o StrictHostKeyChecking=no -r -i {vm['vm_key_path']}  {service['host_src_path']} {vm['vm_username']}@{vm['vm_ip']}:{vm['vm_service_path']}"
            ssh_connect_command = f"""
                ssh -o StrictHostKeyChecking=no -i {vm['vm_key_path']} {vm['vm_username']}@{vm['vm_ip']} cd Services && cd {service['folder_name']} && sudo bash ./{service['service_start_shell_file']}
                """

            os.system(req_file)
            os.system(command)

            output = subprocess.check_output(ssh_connect_command.split())
            container_id = output.strip().decode('utf-8')

            params = {'appName': service['folder_name'], 'imageName': str(service['folder_name']).lower() + "_image", 'vmIp': vm['vm_ip'],
                      'hostPort': service['host_port'], 'containerPort': service['container_port'], 'containerId': container_id}

            res = requests.get("http://20.21.102.175:8050/registerApp", params=params)
            print(res.text)
            ip = res.text.split(":")[0]
            port = res.text.split(":")[1]
            register_service(service["service_name"], ip, port)

            idx = (idx + 1) % 3

        # Write the dictionary to a JSON file to update status
        data = {
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'status': "running"
        }
        with open('platform_status.json', 'w') as outfile:
            json.dump(data, outfile)

        return "Success"

    except Exception as e:
        return str(e)


def stop_service_in_VM():
    services = get_services()
    vm_keys = get_VM_key_details()

    idx = 0

    try:
        for service in services:
            vm = vm_keys[idx]
            ssh_connect_command = f"""
                ssh -o StrictHostKeyChecking=no -i {vm['vm_key_path']} {vm['vm_username']}@{vm['vm_ip']} "cd Services ; cd {service['folder_name']}; 
                sudo bash ./{service['service_end_shell_file']}"
                """

            os.system(ssh_connect_command)

            idx = (idx + 1) % 3

        # Write the dictionary to a JSON file to update status
        data = {
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'status': "stopped"
        }
        with open('platform_status.json', 'w') as outfile:
            json.dump(data, outfile)

        unregister_service()
        return "Success"

    except Exception as e:
        return str(e)


@app.route("/home", methods=['GET'])
@cross_origin()
def home():
    return "Hi, this is Platform Initializer"


@app.route("/health", methods=['GET'])
@cross_origin()
def health():
    return "Ok"


@app.route("/start", methods=["GET"])
@cross_origin()
def start():
    print("Initializing the platform.......")
    return schedule_and_upload_to_VM()


@app.route("/stop", methods=["GET"])
@cross_origin()
def stop():
    print("Stopping the platform.......")
    return stop_service_in_VM()


@app.route("/status", methods=["GET"])
@cross_origin()
def status():
    with open('platform_status.json', 'r') as f:
        conn_json = json.load(f)
    return conn_json


@app.route("/all_services", methods=["GET"])
@cross_origin()
def all_services():
    res = get_all_service_registry()
    print(res)
    return res


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=9050, debug=True, use_reloader=False)
