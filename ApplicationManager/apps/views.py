from flask import Response
from flask_restful import Resource
from flask import request, make_response
from apps.service import save_app, get_apps, get_app, validate_zip

class GetAppsApi(Resource):
    @staticmethod
    def get(username) -> Response:
        """
        GET response method for getting all the apps for a user
        """
        response, status = get_apps(request, username)
        return make_response(response, status)

class GetAppApi(Resource):
    @staticmethod
    def get() -> Response:
        """
        GET response method for getting any specific app details
        """
        response, status = get_app(request)
        return make_response(response, status)

class AppUploadApi(Resource):
    @staticmethod
    def post() -> Response:
        """
        POST response method for adding new app
        :return: JSON object
        """
        inpFile = request.files['inpFile']
        username = request.form['username']
        response, status = validate_zip(request, inpFile, username)
        return make_response(response, status)