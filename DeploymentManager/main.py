import threading
from flask import Flask
from flask_cors import cross_origin
from kafka import KafkaProducer, KafkaConsumer
import json
from azure.storage.blob import BlobServiceClient
import os
from deployment_logger import logger
app = Flask(__name__)

# Configure Kafka producer and consumer
producer = KafkaProducer(
    bootstrap_servers=['20.196.205.46:9092'],
    value_serializer=lambda v: json.dumps(v).encode('utf-8'),
    retries=5,  # Number of times to retry a message in case of failure
    # Ensure only one request is in-flight
    max_in_flight_requests_per_connection=1,
    acks='all',  # Wait for all replicas to acknowledge the message
)

consumer = KafkaConsumer("DeploymentManager", bootstrap_servers=['20.196.205.46:9092'],
                         value_deserializer=lambda m: json.loads(m.decode('utf-8')))

requests_m1_c, requests_m1_p, requests_m2_c, requests_m2_p = [], [], [], []
lock = threading.Lock()


def delete_local_file(app_name):
    files = os.listdir(app_name)

    # Loop through the list and delete each file
    for file in files:
        file_path = os.path.join(app_name, file)
        try:
            if os.path.isfile(file_path):
                os.remove(file_path)
                print(f"{file_path} deleted successfully.")
                logger.info(f"{file_path} deleted successfully.")
        except Exception as e:
            print(f"Error: {e}")
            logger.error(f"Error: {e}")

    os.rmdir(app_name)
    print("####### Directory deleted #######")
    logger.info(f"${app_name} directory deleted successfully.")


def download_from_blob(app_name, folder_name):
    STORAGE_CONTAINER = 'iascontainer'
    AZURE_BLOB_CONN_STRING = 'DefaultEndpointsProtocol=https;AccountName=iot3storage;AccountKey=u3yqnLbhzlY+AQLJspkYm679Ivav12oAtt0f7allcFReHvcZVbAdCL9nD6Xkb0Ls3MaxNfXIQ2p2+ASt23CK7w==;EndpointSuffix=core.windows.net'

    # Create the blob service client
    blob_service_client = BlobServiceClient.from_connection_string(
        AZURE_BLOB_CONN_STRING)

    # Get a reference to the container
    container_client = blob_service_client.get_container_client(
        STORAGE_CONTAINER)

    # List all the blobs in the folder
    blob_list = container_client.list_blobs(name_starts_with=folder_name)

    # Loop through the blob list and print out the name of each blob
    os.mkdir(app_name)
    print("####### Directory made #######")
    logger.info(f"${app_name} directory made.")

    for blob in blob_list:
        # Download the blob to a file
        # Define the name of the file to download
        file_name = blob.name.replace(folder_name, '', 1)

        # Download the blob to a file
        with open(app_name + "/" + file_name, "wb") as my_blob:
            download_stream = container_client.download_blob(blob)
            my_blob.write(download_stream.readall())
        with open(app_name + "/" + file_name, "wb") as my_blob:
            download_stream = container_client.download_blob(blob)
            my_blob.write(download_stream.readall())
            print(file_name + " #### Copied ####")
            my_blob.close()

    # Copying the hard-coded shell file in our local app name folder

    print("########## Deployment code also copied ##########")
    logger.info("Deployment code copied...")


def deployInVM(service_start_shell_file, app_name, vm_ip, vm_username, vm_key_path, vm_service_path):
    file_copy_command = f"scp -r -i {vm_key_path}  {app_name} {vm_username}@{vm_ip}:{vm_service_path}"

    execute_command = f"""
    ssh -i {vm_key_path} {vm_username}@{vm_ip} "cd {app_name}; sudo bash ./{service_start_shell_file}"
    """

    os.system(file_copy_command)
    print("Folder copied")

    delete_local_file(app_name)

    os.system(execute_command)
    print("Executed on VM")
    logger.info("Successfully deployed on VM.")


def create_file(path, file_name, docker_code):
    f = open(path + '/' + file_name, 'w')
    f.write(docker_code)
    f.close()


def docker_file_raw_text(module_filename):
    docker_code = f"""
        FROM python:3.10
        ADD {module_filename} .
        ADD requirements.txt .
        RUN pip3 install -r requirements.txt
        CMD python3 {module_filename}
        """
    return docker_code


def service_start_raw_text(path, image_name, ip, port):
    service_start_shell_script = f'''
        docker build -f {path} -t {image_name} .
        docker container run -d -p {ip}:{port} {image_name}'''

    return service_start_shell_script


def generate_docker_file_and_service_start_shell(path, service, host_port, container_port):
    service = service.lower()
    docker_file_name = service + "_docker_file"
    image_file_name = service + "_img"
    service_start_file_name = service + "_start.sh"

    docker_code = docker_file_raw_text('main.py')
    create_file('./' + path, docker_file_name, docker_code)
    service_start_code = service_start_raw_text(
        docker_file_name, image_file_name, host_port, container_port)
    create_file('./' + path, service_start_file_name, service_start_code)

    return service_start_file_name


def deploy_app(vm_ip, vm_port, app_name):
    # Kafka code to get app name and other details from  Application Manager
    folder_name = f'{app_name}/'
    # Kafka code to get VM details from  Node Manager
    vm_username = "azureuser"
    vm_key_path = "../VM-keys/VM1_key.cer"
    vm_service_path = f"/home/azureuser/{app_name}"
    # ...............................................................

    # Getting app to be deployed in above VM details

    download_from_blob(app_name, folder_name)

    service_start_file_name = generate_docker_file_and_service_start_shell(
        app_name, app_name, vm_port, 7700)

    deployInVM(service_start_file_name, app_name, vm_ip,
               vm_username, vm_key_path, vm_service_path)

    return "Deployment Manager has completed its job"


# -------------------------KAFKA-----------------------------

def send(request_data, msg, c_list, p_list):
    request_id = request_data['request_id']

    lock.acquire()
    if request_id in c_list:
        print("Duplicate message!")
        logger.warning(f"${request_id} has already completed.")
        lock.release()
        return
    c_list.append(request_id)
    lock.release()

    print(f"Request : {request_data}")
    logger.info(f"Request for : ${request_data}")

    # Check if request ID has already been processed before sending message
    lock.acquire()
    if request_id in p_list:
        print("Duplicate message!")
        logger.warning(f"${request_id} is already present in pending list.")
        lock.release()
        return
    p_list.append(request_id)
    lock.release()
    producer.send(msg['to_topic'], msg)


# Define the function for consuming requests and sending responses
def consume_requests():
    global requests_m1_c, requests_m1_p, requests_m2_c, requests_m2_p
    global consumer, producer
    for message in consumer:
        request_data = message.value

        # M1 - message from app manager to deploy
        if "deploy app" in request_data['msg']:
            app_name = request_data['msg'].split("$")[1]
            msg = {
                'to_topic': 'NodeManager',
                'from_topic': 'DeploymentManager',
                'request_id': request_data['request_id'],
                'msg': f'give best node${app_name}'
            }
            send(request_data, msg, requests_m1_c, requests_m1_p)
            logger.info(f"Message- ${msg['msg']}  sent to node manager")

        # M2 - message from node manager with ip and port
        if "ans-node" in request_data['msg']:
            res = json.loads(request_data['msg'].split("$")[
                             1].replace('\'', '"'))
            ip_deploy = "20.21.102.175"
            port_deploy = res["port"]
            app_name = res["app_name"]
            print(ip_deploy, port_deploy, app_name)
            logger.info(
                f"Received Ip and Port from node manager is ${ip_deploy}, ${port_deploy} and app name is ${app_name}")
            # deploy the app
            deploy_app(ip_deploy, port_deploy, app_name)
            logger.info("Deployment Manager has completed its job")

            msg = {
                'to_topic': 'first_topic',
                'from_topic': 'DeploymentManager',
                'request_id': request_data['request_id'],
                'msg': f'done {app_name} deploy - {ip_deploy}:{port_deploy}'
            }
            send(request_data, msg, requests_m2_c, requests_m2_p)
            logger.info(f"Message- ${msg['msg']}  sent to application manager")


@app.route("/home", methods=['GET'])
@cross_origin()
def home():
    return "Hi, this is DeploymentManager"


if __name__ == "__main__":
    logger.info("Starting deployment manager...")
    thread = threading.Thread(target=consume_requests)
    thread.start()
    app.run(host='0.0.0.0', port=8050, debug=True, use_reloader=False)
    thread.join()
