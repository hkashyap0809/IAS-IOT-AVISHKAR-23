from apps.models import App, AppEncoder
from main import db
from utils.common import generate_response
from utils.http_code import HTTP_200_OK, HTTP_201_CREATED, HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED
from zipfile import ZipFile
from contextlib import redirect_stdout
from io import StringIO
from os import path, environ
from werkzeug.utils import secure_filename
import json, random, string
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient
from azure.core.exceptions import ResourceExistsError
import os
import shutil
from flask import jsonify, request
from os import environ
from kafka import KafkaConsumer, KafkaProducer
import threading
from uuid import uuid1
from functools import wraps
import jwt

basedir = path.abspath(path.dirname(__file__))
uploadFolder = path.join(basedir, "..", "static", "uploads")
response = None

def verify_token(f):
    def inner(*args, **kwargs):
        token = None
        req = args[0]
        print(req)
        if 'Authorization' in req.headers:
            auth_header = request.headers['Authorization']
            token = auth_header.split(' ')[1]
        if not token:
            return generate_response(
                data="Unauthorized access1",
                message="Unauthorized access1",
                status=HTTP_401_UNAUTHORIZED
            )
        try:
            data = jwt.decode(token, environ.get("SECRET_KEY"), algorithms=['HS256'])
            userName = data['username']
            return f(userName, *args, **kwargs)
        except Exception as e:
            return generate_response(
                data="Unauthorized access2",
                message="Unauthorized access2",
                status=HTTP_401_UNAUTHORIZED
            )
    return inner

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

def save_app(appName, userName, url=None):
    """
    Saves a new app to the database
    """
    obj = {
        'username': userName,
        'appname': appName
    }
    if url:
        obj['url'] = url
    app = App(**obj)
    try:
        db.session.add(app)
        db.session.commit()
    except Exception as e:
        return generate_response(
            data="Error occurred while saving app name to db",
            message="Error occurred while saving app name to db",
            status=HTTP_400_BAD_REQUEST
        )
    return generate_response(
        data=obj, message="App created", status=HTTP_201_CREATED
    )

def upload_app(target_directory):
    # Target directory has the actual directory with the appName inside the static/uploads folder
    connection_string = environ.get("AZURE_BLOB_CONN_STRING")
    container_name = environ.get("STORAGE_CONTAINER")
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
                print()
                continue

def extractZip(inpFile):
    try:
        with ZipFile(inpFile, 'r') as zip:
            extractPath = path.join(uploadFolder)
            zip.extractall(extractPath)
    except Exception as e:
        return generate_response(
            data="Error occurred while unzipping the zip file",
            message="Error occurred while unzipping the zip file",
            status=HTTP_400_BAD_REQUEST
        )

@verify_token
def validate_zip(userName, request, inpFile):
    if inpFile:
        splittedFileName = (inpFile.filename).split('.')
        if len(splittedFileName) == 1 or splittedFileName[1] != "zip":
            return generate_response(
                data="Only zip files allowed to be uploaded",
                message="Only zip files allowed to be uploaded",
                status=HTTP_400_BAD_REQUEST
            )
        fileName = splittedFileName[0]
        file_list = []
        expected_file_list = ['app.json', 'app.py', 'requirements.txt', 'index.html']

        with StringIO() as buffer:
            # redirect the stdout to the buffer
            with redirect_stdout(buffer):
                # print some output
                with ZipFile(inpFile, 'r') as zip:
                    zip.printdir()
            # append the output to the list
            file_list.append(buffer.getvalue())

        for file in expected_file_list:
            if file not in file_list[0]:
                return generate_response(
                    data=f'Expected file {file} to be a present in zip',
                    message=f'Expected file {file} to be a present in zip',
                    status=HTTP_400_BAD_REQUEST
                )
        with ZipFile(inpFile, 'r') as zip:
            data = zip.read(fileName + '/app.json')
            data = json.loads(data.decode())
            # expected_keys = ["app_name", "controller_instance_count", "controller_instance_info"]
            expected_keys = ["app_name", "sensors", "files", "workflow_used", "entry_point"]
            keys = data.keys()
            # Check if json file has same number of keys as expected_keys
            if len(keys) != len(expected_keys):
                return generate_response(
                    data="Expected %d keys but got %d" % (len(expected_keys), len(keys)),
                    message="Expected %d keys but got %d" % (len(expected_keys), len(keys)),
                    status=HTTP_400_BAD_REQUEST
                )
            # Check if json file has same keys as expected_keys.. Not more not less
            for k in expected_keys:
                if k not in keys:
                    return generate_response(
                        data="Missing key: %s" % (k),
                        message="Missing key: %s" % (k),
                        status=HTTP_400_BAD_REQUEST
                    )
            appName = data["app_name"]
            # Check if app_name property inside JSON file and name of zipFile is same or not
            if appName != fileName:
                return generate_response(
                    data="app_name is not same as filename",
                    message="app_name is not same as filename",
                    status=HTTP_400_BAD_REQUEST
                )
            if not isinstance(data["sensors"], list):
                return generate_response(
                    data="sensors property should be a list containing sensor keywords",
                    message="sensors property should be a list containing sensor keywords",
                    status=HTTP_400_BAD_REQUEST
                )
            if len(data["sensors"]) == 0:
                return generate_response(
                    data="No sensors provided",
                    message="No sensors provided",
                    status=HTTP_400_BAD_REQUEST
                )
            if not isinstance(data["files"], list):
                return generate_response(
                    data="files property should be a list containing all relevant files",
                    message="files property should be a list containing all relevant files",
                    status=HTTP_400_BAD_REQUEST
                )
            if len(data["files"]) == 0:
                return generate_response(
                    data="No files provided",
                    message="No files provided",
                    status=HTTP_400_BAD_REQUEST
                )
            expected_file_names = ["app.py", "requirements.txt", "index.html"]
            received_file_names = data["files"]
            for file in received_file_names:
                if file not in expected_file_names:
                    return generate_response(
                        data=f'Expected file with name {file}',
                        message=f'Expected file with name {file}',
                        status=HTTP_400_BAD_REQUEST
                    )
            if not isinstance(data["workflow_used"], list):
                return generate_response(
                    data="workflow_used should be a list",
                    message="workflow_used should be a list",
                    status=HTTP_400_BAD_REQUEST
                )
            print("Validation done successfully!!")
        # Extract the zip file and store it
        extractZip(inpFile)
    # Upload the extracted zip file to Azure Blob
    try:
        upload_app(uploadFolder + "/" + appName)
    except Exception as e:
        return generate_response(
            data="Error occurred while uploading zip",
            message="Error occurred while uploading zip",
            status=HTTP_400_BAD_REQUEST
        )
    else:
        # Cleaning up leftovers after zip file uploaded successfully
        shutil.rmtree(uploadFolder + "/" + appName)

        # to_topic, from_topic = 'DeploymentManager', 'first_topic'
        # producer = KafkaProducer(bootstrap_servers=[environ.get("KAFKA_SERVER")])
        # uid = str(uuid1())
        # print("UID is: ", uid)
        # message = {
        #     'to_topic': to_topic,
        #     'from_topic': from_topic,
        #     'request_id': uid,
        #     'msg': f'deploy app${appName}'
        # }
        # producer.send(to_topic, json.dumps(message).encode('utf-8'))

        # t = threading.Thread(target=wait_for_message, args=(from_topic, appName, uid))
        # t.start()
        # t.join()
        # Save appName with the corresponding app developer name in the database
        save_app(appName, userName)

    return generate_response(
        data=response,
        message="JSON validated successfully and app deployed",
        status=HTTP_200_OK
    )

@verify_token
def get_apps(userName, request):
    """
    Get all the apps owned by an application developer
    """
    apps = App.query.filter_by(username=userName).all()
    apps = [{
        "id": app.id,
        "username": app.username,
        "created": app.created,
        "appname": app.appname,
        "url": app.url
    } for app in apps]
    return generate_response(
        data=apps,
        message="Apps fetched successfully",
        status=HTTP_200_OK
    )

def get_app(request, appId):
    """
    Get information about a specific app
    """
    details = App.query.filter_by(id=appId)
    print(details)
    return generate_response(
        message="App details fetched successfully",
        status=HTTP_200_OK
    )

def checkFileNameHandler(fileName):
    details = App.query.filter_by(appname=fileName).all()
    return len(details) == 0

def checkFileName(request, inpFile):
    if inpFile:
        splittedFileName = (inpFile.filename).split('.')
        if len(splittedFileName) == 1 or splittedFileName[1] != "zip":
            return generate_response(
                data="Only zip files allowed to be uploaded",
                message="Only zip files allowed to be uploaded",
                status=HTTP_400_BAD_REQUEST
            )
        fileName = splittedFileName[0]
        resp = checkFileNameHandler(fileName)
        # Returns true if fileName does not exist else returns false
        message = "AppName Available" if resp else "AppName Unavailable! Please pick a different AppName"
        return generate_response(
            data=resp,
            message=message,
            status=HTTP_200_OK
        )