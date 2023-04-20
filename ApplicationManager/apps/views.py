from flask import Response
from flask_restful import Resource
from flask import request, make_response
from apps.service import save_app, get_apps, get_app, validate_zip, checkFileName

class GetAppsApi(Resource):
    @staticmethod
    def get() -> Response:
        """
        GET response method for getting all the apps for a user
        """
        response, status = get_apps(request)
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
        # username = request.form['username']
        response, status = validate_zip(request, inpFile)
        return make_response(response, status)

class CheckFileName(Resource):
    @staticmethod
    def post() -> Response:
        """
        POST response method for checking app with the given name
        exists or not
        :return: JSON object
        """
        inpFile = request.files['inpFile']
        response, status = checkFileName(request, inpFile)
        return make_response(response, status)