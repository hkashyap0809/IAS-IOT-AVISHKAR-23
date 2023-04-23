import os
import jwt
from datetime import datetime, timedelta, timezone
from utils.http_code import HTTP_200_OK, HTTP_201_CREATED, HTTP_401_UNAUTHORIZED
from flask import request
from os import environ


def generate_response(data=None, message=None, status=400):
    """
    It takes in a data, message, and status, and returns a dictionary with the data, message, and status

    :param data: The data that you want to send back to the client
    :param message: This is the message that you want to display to the user
    :param status: The HTTP status code, defaults to 400 (optional)
    :return: A dictionary with the keys: data, message, status.
    """
    if status == HTTP_200_OK or status == HTTP_201_CREATED:
        status_bool = True
    else:
        status_bool = False

    return {
        "data": data,
        "message": modify_slz_error(message, status_bool),
        "status": status_bool,
    }, status


def modify_slz_error(message, status):
    """
    It takes a message and a status, and returns a list of errors

    :param message: The error message that you want to display
    :param status: The HTTP status code you want to return
    :return: A list of dictionaries.
    """
    final_error = list()
    if message:
        if type(message) == str:
            if not status:
                final_error.append({"error": message})
            else:
                final_error = message
        elif type(message) == list:
            final_error = message
        else:
            for key, value in message.items():
                final_error.append({"error": str(key) + ": " + str(value[0])})
    else:
        final_error = None
    return final_error


def verify_token(f):
    def inner(*args, **kwargs):
        token = None
        req = args[0]
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
            print(data)
            userName = data['username']
            role = data['user_type']
            return f(userName, role, *args, **kwargs)
        except Exception as e:
            print("Error is: ", e)
            return generate_response(
                data="Unauthorized access2",
                message="Unauthorized access2",
                status=HTTP_401_UNAUTHORIZED
            )
    return inner