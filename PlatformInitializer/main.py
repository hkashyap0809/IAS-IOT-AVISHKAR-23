import os
import json
from datetime import datetime
from service_registry import *


def create_file(path, file_name, docker_code):
    f = open(path + '/' + file_name, 'w')
    f.write(docker_code)
    f.close()


def docker_file_raw_text():
    docker_code = f"""
        FROM python:3.10
        ADD . .
        RUN pip3 install -r requirements.txt
        CMD python3 ./main.py
        """
    return docker_code


def service_start_raw_text(docker_file_name, image_name, container_name, host_port, container_port):
    service_start_shell_script = f'''
        docker stop {container_name}
        docker rm {container_name}
        docker build -f {docker_file_name} -t {image_name} .
        docker container run -d --name {container_name} -p {host_port}:{container_port} {image_name}
    '''

    return service_start_shell_script


def service_end_raw_text(docker_file_name, image_name, container_name, host_port, container_port):
    service_end_shell_script = f'''
        docker stop {container_name}
        docker rm {container_name}
    '''

    return service_end_shell_script


def generate_docker_file_and_service_start_shell(path, service, host_port, container_port):
    docker_file_name = service + "_docker_file"
    image_file_name = service + "_img"
    container_name = service + "_container"
    service_start_file_name = service + "_start.sh"
    service_end_file_name = service + "_end.sh"

    docker_code = docker_file_raw_text()
    create_file('./' + path, docker_file_name, docker_code)
    service_start_code = service_start_raw_text(docker_file_name, image_file_name, container_name, host_port, container_port)
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
            generate_docker_file_and_service_start_shell(service['host_src_path'], service['service_name'],
                                                         service['host_port'], service['container_port'])
            req_file = "pip freeze > requirements.txt"
            command = f"scp -r -i {vm['vm_key_path']}  {service['host_src_path']} {vm['vm_username']}@{vm['vm_ip']}:{vm['vm_service_path']}"
            ssh_connect_command = f"""
                ssh -i {vm['vm_key_path']} {vm['vm_username']}@{vm['vm_ip']} "cd Services ; cd {service['folder_name']}; 
                sudo bash ./{service['service_start_shell_file']}"
                """

            os.system(req_file)
            os.system(command)
            os.system(ssh_connect_command)

            register_service(service["service_name"], vm["vm_ip"], service["host_port"])

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
                ssh -i {vm['vm_key_path']} {vm['vm_username']}@{vm['vm_ip']} "cd Services ; cd {service['folder_name']}; 
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


if __name__ == "__main__":
    print("Initializing the platform.......")
    schedule_and_upload_to_VM()
    # stop_service_in_VM()
    print(get_all_service_registry())
