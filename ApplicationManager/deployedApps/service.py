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


@verify_token
def getDeployedApps(userName, role, request):
    apps = None
    if role == "user":
        apps = DeployedApp.query.filter_by(userName=userName).all()
    elif role == "dev":
        apps = DeployedApp.query.filter_by(developer=userName).all()
    elif role == "admin":
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
    connectionString = environ.get("AZURE_BLOB_CONN_STRING")
    directoryPrefix = baseAppName
    blobServiceClient = BlobServiceClient.from_connection_string(connectionString)
    baseContainerName = environ.get("BASE_APPS_CONTAINER")
    containerClient = blobServiceClient.get_container_client(container=baseContainerName)
    # blobList = blobServiceClient.list_blobs(container=baseContainerName, prefix=directoryPrefix)
    blobList = containerClient.list_blobs(name_starts_with=directoryPrefix)
    # Download each blob individually
    for blob in blobList:
        print(blob.name)
        blobName = (blob.name).split('/')[1]
        blobClient = blobServiceClient.get_blob_client(container=baseContainerName, blob=blob.name)
        blob_data = blobClient.download_blob().content_as_bytes()
        # with open("{}/{}".format(appFolder, blob.name), "wb") as f:
        with open("{}/{}".format(appFolder, blobName), "wb") as f:
            f.write(blob_data)
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
    deployedContainerName = environ.get("DEPLOYED_APPS_CONTAINER")
    blobServiceClient = BlobServiceClient.from_connection_string(connectionString)
    blobServiceClient.get_container_client(deployedContainerName)
    overwrite=False
    for folder in os.walk(appFolder):
        for file in folder[-1]:
            try:
                blob_path = os.path.join(folder[0].replace(uploadFolder + '/', ''), file)
                blob_obj = blobServiceClient.get_blob_client(container=deployedContainerName, blob=blob_path)

                with open(os.path.join(folder[0], file), mode='rb') as fileData:
                    blob_obj.upload_blob(fileData, overwrite = overwrite)
            except ResourceExistsError as e:
                print(e)
                return generate_response(
                    data="Error occurred while uploading replica zip",
                    message="Error occurred while uploading replica zip",
                    status=HTTP_400_BAD_REQUEST
                )
    # **************************** Delete the folder from static folder ****************************
    shutil.rmtree(appFolder)
    # **************************** Now ask the deployment manager to deploy the app ****************************
    # to_topic, from_topic = 'DeploymentManager', 'first_topic'
    # producer = KafkaProducer(bootstrap_servers=[environ.get("KAFKA_SERVER")])
    # uid = str(uuid1())
    # print("UID is: ", uid)
    # message = {
    #     'to_topic': to_topic,
    #     'from_topic': from_topic,
    #     'request_id': uid,
    #     'msg': f'deploy app${replicatedAppName}'
    # }
    # producer.send(to_topic, json.dumps(message).encode('utf-8'))

    # t = threading.Thread(target=wait_for_message, args=(from_topic, replicatedAppName, uid))
    # t.start()
    # t.join()
    # print(response)
    # url = response['msg'].split("-")
    # url = url[1].strip()
    # print(url)
    url = "http://localhost:4000"
    # **************************** Save the url into deployedApps table  ****************************
    obj = {
        'baseAppId': baseAppId,
        'developer': developer,
        'deployedAppName': replicatedAppName,
        'userName': userName,
        'url': url
    }
    deployedApp = DeployedApp(**obj)
    try:
        db.session.add(deployedApp)
        db.session.commit()
    except Exception as e:
        print(e)
        return generate_response(
            message="Error occurred while saving the replicated app to deployed database",
            status=HTTP_400_BAD_REQUEST
        )
    # **************************** Change the status of baseApp to deployed in baseApps table ****************************
    baseApp = BaseApp.query.filter_by(appName=inputData.get('baseAppName')).first()
    try:
        baseApp.status = 'deployed'
        db.session.commit()
    except Exception as e:
        print(e)
        return generate_response(
            message="Error occurred while updating status of baseApp",
            status=HTTP_400_BAD_REQUEST
        )
    # **************************** Send response to user ****************************
    return generate_response(
        message=f'{baseAppName} deployed succesfully on {url}',
        status=HTTP_201_CREATED
    )


