import json
import jwt
import datetime
from server import db
from os import environ, path
from users.models import User
from flask_bcrypt import generate_password_hash
from utils.common import generate_response, TokenGenerator
from users.validation import (
    CreateLoginInputSchema,
    CreateSignupInputSchema
)
from utils.http_code import HTTP_200_OK, HTTP_201_CREATED, HTTP_400_BAD_REQUEST
from werkzeug.utils import secure_filename
import json, random, string
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient
from zipfile import ZipFile, ZIP_DEFLATED
import shutil, os
from azure.core.exceptions import ResourceExistsError

basedir = path.abspath(path.dirname(__file__))
uploadFolder = path.join(basedir, "..", "static", "uploads")

def create_user(request, input_data):
    """
    It creates a new user

    :param request: The request object
    :param input_data: This is the data that is passed to the function
    :return: A response object
    """
    create_validation_schema = CreateSignupInputSchema()
    errors = create_validation_schema.validate(input_data)
    if errors:
        return generate_response(message=errors)
    check_username_exist = User.query.filter_by(
        username=input_data.get("username")
    ).first()
    check_email_exist = User.query.filter_by(email=input_data.get("email")).first()
    if check_username_exist:
        return generate_response(
            message="Username already exist", status=HTTP_400_BAD_REQUEST
        )
    elif check_email_exist:
        return generate_response(
            message="Email  already taken", status=HTTP_400_BAD_REQUEST
        )

    new_user = User(**input_data)  # Create an instance of the User class
    new_user.hash_password()
    db.session.add(new_user)  # Adds new User record to database
    db.session.commit()  # Comment
    del input_data["password"]
    return generate_response(
        data=input_data, message="User Created", status=HTTP_201_CREATED
    )


def login_user(request, input_data):
    """
    It takes in a request and input data, validates the input data, checks if the user exists, checks if
    the password is correct, and returns a response

    :param request: The request object
    :param input_data: The data that is passed to the function
    :return: A dictionary with the keys: data, message, status
    """
    create_validation_schema = CreateLoginInputSchema()
    errors = create_validation_schema.validate(input_data)
    if errors:
        return generate_response(message=errors)

    get_user = User.query.filter_by(email=input_data.get("email")).first()
    if get_user is None:
        return generate_response(message="User not found", status=HTTP_400_BAD_REQUEST)
    if get_user.check_password(input_data.get("password")):
        token = jwt.encode(
            {
                "id": get_user.id,
                "email": get_user.email,
                "username": get_user.username,
                "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=30),
            },
            environ.get("SECRET_KEY"),
        )
        input_data["token"] = token
        input_data["username"] = get_user.username
        input_data["role"] = get_user.role
        del input_data["password"]
        return generate_response(
            data=input_data, message="User login successfully", status=HTTP_201_CREATED
        )
    else:
        return generate_response(
            message="Password is wrong", status=HTTP_400_BAD_REQUEST
        )

def id_generator(size=32, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))

# def upload_app(target_directory):
#     # Target directory has the actual directory with the appName inside the static/uploads folder
#     connection_string = environ.get("AZURE_BLOB_CONN_STRING")
#     container_name = environ.get("STORAGE_CONTAINER")
#     blob_service_client = BlobServiceClient.from_connection_string(connection_string)
#     blob_service_client.get_container_client(container_name)
#     overwrite = False
#     for folder in os.walk(target_directory):
#         for file in folder[-1]:
#             try:
#                 blob_path = os.path.join(folder[0].replace(uploadFolder + '/', ''), file)
#                 blob_obj = blob_service_client.get_blob_client(container=container_name, blob=blob_path)

#                 with open(os.path.join(folder[0], file), mode='rb') as fileData:
#                     blob_obj.upload_blob(fileData, overwrite = overwrite)
#             except ResourceExistsError:
#                 print('Blob "{0}" already exists'.format(blob_path))
#                 print()
#                 continue

# def validate_zip(request, inpFile):
#     if inpFile:
#         splittedFileName = (inpFile.filename).split('.')
#         fileName, extension = splittedFileName[0], splittedFileName[1]
#         if extension != 'zip':
#             return generate_response(
#                 data="Only zip files allowed to be uploaded",
#                 message="Only zip files allowed to be uploaded",
#                 status=HTTP_400_BAD_REQUEST
#             )
#         with ZipFile(inpFile, 'r') as zip:
#             data = zip.read(fileName + '/app.json')
#             data = json.loads(data.decode())
#             expected_keys = ["app_name", "controller_instance_count", "controller_instance_info"]
#             keys = data.keys()
#             if len(keys) != len(expected_keys):
#                 return generate_response(
#                     data="Expected %d keys but got %d" % (len(expected_keys), len(keys)),
#                     message="Expected %d keys but got %d" % (len(expected_keys), len(keys)),
#                     status=HTTP_400_BAD_REQUEST
#                 )
#             for k in expected_keys:
#                 if k not in keys:
#                     return generate_response(
#                         data="Missing key: %s" % (k),
#                         message="Missing key: %s" % (k),
#                         status=HTTP_400_BAD_REQUEST
#                     )
#             appName = data["app_name"]
#         with ZipFile(inpFile, 'r') as zip:
#             extractPath = path.join(uploadFolder)
#             zip.extractall(extractPath)
#     # inpFile.save(uploadFolder + "/" + appName + ".zip")
#     uploadDir = os.path.join(uploadFolder, appName + '.zip')
#     # upload_app(uploadDir, appName)
#     upload_app(uploadFolder + "/" + appName)
#     return generate_response(
#         message="JSON validated successfully", status=HTTP_200_OK
#     )