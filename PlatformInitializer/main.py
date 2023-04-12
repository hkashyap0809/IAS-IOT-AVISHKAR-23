import os
import json


def create_file(path, file_name, docker_code):
    f = open(path + '/' + file_name, 'w')
    f.write(docker_code)
    f.close()


def docker_file_raw_text(path, module_filename, dependencies):
    dependencies = " ".join(dependencies)
    docker_code = f"""
        FROM python:3.10
        ADD {module_filename} .
        RUN pip install {dependencies}
        CMD python3 {module_filename}
        """
    return docker_code


def service_start_raw_text(path, image_name, ip, port):
    service_start_shell_script = f'''
        docker build -f {path} -t {image_name} .
        docker container run -d -p {ip}:{port} {image_name}'''

    return service_start_shell_script


def generate_docker_file_and_service_start_shell(path, service, host_port, container_port):
    docker_file_name = service + "_docker_file"
    image_file_name = service + "_img"
    service_start_file_name = service + "_start.sh"

    docker_code = docker_file_raw_text(path, 'main.py', ['numpy', 'pandas'])
    create_file('./' + path, docker_file_name, docker_code)
    service_start_code = service_start_raw_text(docker_file_name, image_file_name, host_port, container_port)
    create_file('./' + path, service_start_file_name, service_start_code)


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

    for service in services:
        vm = vm_keys[idx]

        command = f"scp -r -i {vm['vm_key_path']}  {service['host_src_path']} {vm['vm_username']}@{vm['vm_ip']}:{vm['vm_service_path']}"

        ssh_connect_command = f"""
            ssh -i {vm['vm_key_path']} {vm['vm_username']}@{vm['vm_ip']} "cd Services ; cd {service['folder_name']}; 
            sudo bash ./{service['service_start_shell_file']}"
            """

        os.system(command)
        os.system(ssh_connect_command)
        idx = (idx + 1) % 3


if __name__ == "__main__":
    print("Initializing the platform.......")

    service_details = get_services()
    schedule_and_upload_to_VM()
