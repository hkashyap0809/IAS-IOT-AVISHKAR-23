from deployedApps.models import DeployedApp
from baseApps.models import BaseApp
from main import db
from utils.common import generate_response, verify_token
from utils.http_code import HTTP_200_OK, HTTP_201_CREATED, HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED
from deployedApps.validation import CreateDeployAppInputSchema
from zipfile import ZipFile
from contextlib import redirect_stdout
from io import StringIO
from os import path, environ
from werkzeug.utils import secure_filename
import json
from azure.storage.blob import BlobServiceClient
from azure.core.exceptions import ResourceExistsError
import os
import shutil
from flask import jsonify, request
from os import environ
from uuid import uuid1
from functools import wraps
from azure.storage.blob import BlobServiceClient
from kafka import KafkaConsumer, KafkaProducer
import threading

basedir = path.abspath(path.dirname(__file__))
uploadFolder = path.join(basedir, "..", "static", "uploads")
response = None

def wait_for_message(from_topic, appName, uid):
    global response
    consumer = KafkaConsumer(from_topic, bootstrap_servers=[environ.get("KAFKA_SERVER")])
    for msg in consumer:
        received_message = json.loads(msg.value.decode('utf-8'))
        print(received_message)
        if f'done {appName} deploy' in received_message['msg'] and received_message['request_id'] == uid:
            # Do something with received message
            response = received_message
            print("App deployed")
            break

def upload_app(target_directory):
    # Target directory has the actual directory with the appName inside the static/uploads folder
    connection_string = environ.get("AZURE_BLOB_CONN_STRING")
    container_name = environ.get("DEPLOYED_APPS_CONTAINER")
    blob_service_client = BlobServiceClient.from_connection_string(connection_string)
    blob_service_client.get_container_client(container_name)
    overwrite = False
    for folder in os.walk(target_directory):
        for file in folder[-1]:
            try:
                blob_path = os.path.join(folder[0].replace(uploadFolder + '/', ''), file)
                blob_obj = blob_service_client.get_blob_client(container=container_name, blob=blob_path)

                with open(os.path.join(folder[0], file), mode='rb') as fileData:
                    blob_obj.upload_blob(fileData, overwrite = overwrite)
            except ResourceExistsError:
                print('Blob "{0}" already exists'.format(blob_path))
                continue

def download_blob(appFolder, baseAppName):
    MY_CONNECTION_STRING = environ.get("AZURE_BLOB_CONN_STRING")
    # Replace with blob container
    MY_BLOB_CONTAINER = environ.get("BASE_APPS_CONTAINER")

    # Replace with the local folder where you want files to be downloaded
    LOCAL_BLOB_PATH = appFolder
    blobServiceClient = BlobServiceClient.from_connection_string(MY_CONNECTION_STRING)
    myContainer = blobServiceClient.get_container_client(MY_BLOB_CONTAINER)

    my_blobs = myContainer.list_blobs()

    for blob in my_blobs:
        if baseAppName + "/" in blob.name:
            print(blob.name)
            bytes = myContainer.get_blob_client(blob).download_blob().readall()
            removeAppNameFromPath = (blob.name).split("/")
            removeAppNameFromPath = "/".join(removeAppNameFromPath[1:])
            download_file_path = os.path.join(LOCAL_BLOB_PATH, removeAppNameFromPath)
            os.makedirs(os.path.dirname(download_file_path), exist_ok=True)
            with open(download_file_path, "wb") as file:
                file.write(bytes)

@verify_token
def getDeployedApps(userName, role, request):
    apps = None
    if role == "user":
        with db.session() as session:
            apps = DeployedApp.query.filter_by(userName=userName).all()
    elif role == "dev":
        with db.session() as session:
            apps = DeployedApp.query.filter_by(developer=userName).all()
    elif role == "admin":
        with db.session() as session:
            apps = DeployedApp.query.filter_by().all()
    apps = [{
        "id": app.id,
        "baseAppId": app.baseAppId,
        "developer": app.developer,
        "deployedAppName": app.deployedAppName,
        "userName": app.userName,
        "created": app.created,
        "url": app.url
    } for app in apps]
    return generate_response(
        data=apps,
        message="Apps fetched successfully",
        status=HTTP_200_OK
    )

@verify_token
def deployApp(userName, role, request, inputData):
    # if role != 'dev':
    #     return generate_response(
    #         data="Unauthorized access",
    #         message="Unauthorized access",
    #         status=HTTP_401_UNAUTHORIZED
    #     )
    createValidationSchema = CreateDeployAppInputSchema()
    errors = createValidationSchema.validate(inputData)
    if errors:
        return generate_response(
            message=errors
        )
    baseAppId = inputData.get('baseAppId')
    baseAppName = inputData.get('baseAppName')
    developer = inputData.get('developer')
    print(baseAppName)
    location = inputData.get('location')
    replicatedAppName = baseAppName + '_' + str(uuid1())
    appFolder = os.path.join(uploadFolder, replicatedAppName)
    os.mkdir(appFolder)
    # **************************** Download baseApp folder from azure ****************************
    download_blob(appFolder, baseAppName)
    # **************************** Add Location to json file ****************************
    jsonFileName = 'app.json'
    jsonFilePath = os.path.join(uploadFolder, replicatedAppName, jsonFileName)
    f = open(jsonFilePath)
    data = json.load(f)
    print(data)
    data["location"] = location
    serializeDataObj = json.dumps(data, indent=2)
    with open(jsonFilePath, 'w') as f:
        f.write(serializeDataObj)
    # **************************** Upload folder back to azure ****************************
    upload_app(appFolder)
    # **************************** Delete the folder from static folder ****************************
    shutil.rmtree(appFolder)
    # **************************** Now ask the deployment manager to deploy the app ****************************
    to_topic, from_topic = 'DeploymentManager', 'first_topic'
    producer = KafkaProducer(bootstrap_servers=[environ.get("KAFKA_SERVER")])
    uid = str(uuid1())
    print("UID is: ", uid)
    message = {
        'to_topic': to_topic,
        'from_topic': from_topic,
        'request_id': uid,
        'msg': f'deploy app${replicatedAppName}'
    }
    producer.send(to_topic, json.dumps(message).encode('utf-8'))

    t = threading.Thread(target=wait_for_message, args=(from_topic, replicatedAppName, uid))
    t.start()
    t.join()
    print(response)
    if "done" in response["msg"]:
        url = response['msg'].split("deploy - ")
        url = url[1].strip()
        print(url)
    else:
        return generate_response(
            message="Some error occurred... App not deployed",
            status=HTTP_400_BAD_REQUEST
        )
    # url = "localhost:4000"
    # **************************** Save the url into deployedApps table  ****************************
    obj = {
        'baseAppId': baseAppId,
        'developer': developer,
        'deployedAppName': replicatedAppName,
        'userName': userName,
        'url': 'http://' + url
    }
    deployedApp = DeployedApp(**obj)
    try:
        db.session.add(deployedApp)
        db.session.commit()
        db.session.close()
    except Exception as e:
        print(e)
        return generate_response(
            message="Error occurred while saving the replicated app to deployed database",
            status=HTTP_400_BAD_REQUEST
        )
    # **************************** Change the status of baseApp to deployed in baseApps table ****************************
    with db.session() as session:
        baseApp = BaseApp.query.filter_by(appName=inputData.get('baseAppName')).first()
        try:
            baseApp.status = 'deployed'
            session.commit()
        except Exception as e:
            print(e)
            session.close()
            return generate_response(
                message="Error occurred while updating status of baseApp",
                status=HTTP_400_BAD_REQUEST
            )
    # **************************** Send response to user ****************************
    return generate_response(
        message=f'{baseAppName} deployed succesfully on {url}',
        status=HTTP_201_CREATED
    )


