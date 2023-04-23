from baseApps.models import BaseApp
from main import db
from utils.common import generate_response, verify_token
from utils.http_code import HTTP_200_OK, HTTP_201_CREATED, HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED
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
import jwt

basedir = path.abspath(path.dirname(__file__))
uploadFolder = path.join(basedir, "..", "static", "uploads")

def saveBaseApp(appName, userName):
    """
    Saves a new baseApp to the database
    """
    obj = {
        'appName': appName,
        'developer': userName
    }
    baseApp = BaseApp(**obj)
    try:
        db.session.add(baseApp)
        db.session.commit()
    except Exception as e:
        print(e)
        return generate_response(
            data="Error occurred while saving the app to db",
            message="Error occurred while saving the app to database",
            status=HTTP_400_BAD_REQUEST
        )
    return generate_response(
        data=obj, message="App uploaded successfully", status=HTTP_201_CREATED
    )

def upload_app(target_directory):
    # Target directory has the actual directory with the appName inside the static/uploads folder
    connection_string = environ.get("AZURE_BLOB_CONN_STRING")
    container_name = environ.get("BASE_APPS_CONTAINER")
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
def validate_zip(userName, role, request, inpFile):
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
        expected_file_list = ['app.json', 'main.py', 'requirements.txt', 'index.html']
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
            expected_keys = ["applicationType", "sensorTypes", "location", "applicationName", "applicationDescription"]
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
            # appName = data["app_name"]
            appName = data["applicationName"]
            # Check if app_name property inside JSON file and name of zipFile is same or not
            if appName != fileName:
                return generate_response(
                    data="app_name is not same as filename",
                    message="app_name is not same as filename",
                    status=HTTP_400_BAD_REQUEST
                )
            if not isinstance(data["sensorTypes"], list):
                return generate_response(
                    data="sensorTypes property should be a list containing sensors",
                    message="sensorTypes property should be a list containing sensors",
                    status=HTTP_400_BAD_REQUEST
                )
            if len(data["sensorTypes"]) == 0:
                return generate_response(
                    data="No sensors provided",
                    message="No sensors provided",
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
        saveBaseApp(appName, userName)

    return generate_response(
        data=f"App {appName} validated and uploaded successfully",
        message=f"App {appName} validated and uploaded successfully",
        status=HTTP_200_OK
    )

@verify_token
def get_apps(userName, role, request):
    """
    Get all the apps owned by an application developer
    """
    apps = None
    if role == "user" or role == "admin":
        apps = BaseApp.query.filter_by().all()
    elif role == "dev":
        apps = BaseApp.query.filter_by(developer=userName).all()
    apps = [{
        "id": app.id,
        "developer": app.developer,
        "created": app.created,
        "appName": app.appName,
        "status": app.status
    } for app in apps]
    return generate_response(
        data=apps,
        message="Apps fetched successfully",
        status=HTTP_200_OK
    )

def checkFileNameHandler(fileName):
    details = BaseApp.query.filter_by(appName=fileName).all()
    return len(details) == 0

@verify_token
def checkFileName(userName, role, request, inpFile):
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

# // stop app$<appname>$<ip>