from apps.models import App, AppEncoder
from main import db
from utils.common import generate_response
from utils.http_code import HTTP_200_OK, HTTP_201_CREATED, HTTP_400_BAD_REQUEST
from zipfile import ZipFile
from os import path, environ
from werkzeug.utils import secure_filename
import json, random, string
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient
from azure.core.exceptions import ResourceExistsError
import os
import shutil
from flask import jsonify
from os import environ
from kafka import KafkaConsumer, KafkaProducer
import threading
from uuid import uuid1

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

def save_app(appName, userName):
    """
    Saves a new app to the database
    """
    obj = {
        'username': userName,
        'appname': appName
    }
    app = App(**obj)
    try:
        db.session.add(app)
        db.session.commit()
    except Exception as e:
        return generate_response(
            data="Error occurred while saving app to db",
            message="Error occurred while saving app to db",
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

def validate_zip(request, inpFile, userName):
    if inpFile:
        splittedFileName = (inpFile.filename).split('.')
        fileName, extension = splittedFileName[0], splittedFileName[1]
        if extension != 'zip':
            return generate_response(
                data="Only zip files allowed to be uploaded",
                message="Only zip files allowed to be uploaded",
                status=HTTP_400_BAD_REQUEST
            )
        with ZipFile(inpFile, 'r') as zip:
            data = zip.read(fileName + '/app.json')
            data = json.loads(data.decode())
            expected_keys = ["app_name", "controller_instance_count", "controller_instance_info"]
            keys = data.keys()
            if len(keys) != len(expected_keys):
                return generate_response(
                    data="Expected %d keys but got %d" % (len(expected_keys), len(keys)),
                    message="Expected %d keys but got %d" % (len(expected_keys), len(keys)),
                    status=HTTP_400_BAD_REQUEST
                )
            for k in expected_keys:
                if k not in keys:
                    return generate_response(
                        data="Missing key: %s" % (k),
                        message="Missing key: %s" % (k),
                        status=HTTP_400_BAD_REQUEST
                    )
            appName = data["app_name"]
        with ZipFile(inpFile, 'r') as zip:
            extractPath = path.join(uploadFolder)
            zip.extractall(extractPath)
    uploadDir = os.path.join(uploadFolder, appName + '.zip')
    try:
        upload_app(uploadFolder + "/" + appName)
    except Exception as e:
        pass
    else:
        shutil.rmtree(uploadFolder + "/" + appName)
        save_app(appName, userName)

        to_topic, from_topic = 'DeploymentManager', 'first_topic'
        producer = KafkaProducer(bootstrap_servers=[environ.get("KAFKA_SERVER")])
        uid = str(uuid1())
        print("UID is: ", uid)
        message = {
            'to_topic': to_topic,
            'from_topic': from_topic,
            'request_id': uid,
            'msg': f'deploy app${appName}'
        }
        producer.send(to_topic, json.dumps(message).encode('utf-8'))

        # def wait_for_message():
        #     global response
        #     consumer = KafkaConsumer(from_topic, bootstrap_servers=[environ.get("KAFKA_SERVER")])
        #     for msg in consumer:
        #         received_message = json.loads(msg.value.decode('utf-8'))
        #         print(received_message)
        #         if f'done {appName} deploy' in received_message['msg'] and received_message['request_id'] == uid:
        #             # Do something with received message
        #             response = received_message
        #             print("App deployed")
        #             break
        t = threading.Thread(target=wait_for_message, args=(from_topic, appName, uid))
        t.start()
        t.join()

    return generate_response(
        data=response,
        message="JSON validated successfully and app deployed",
        status=HTTP_200_OK
    )

def get_apps(request, username):
    """
    Get all the apps owned by an application developer
    """
    apps = App.query.filter_by(username=username).all()
    print(apps)
    # apps = jsonify(apps=apps, indent=4, cls=AppEncoder)
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

