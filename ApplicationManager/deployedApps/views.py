from flask import Response
from flask_restful import Resource
from flask import request, make_response
from deployedApps.service import getDeployedApps, deployApp, scheduleApp, getScheduledApps, getDeployInProgressApps, stopDeployedApp

class GetDeployedAppsApi(Resource):
    @staticmethod
    def get() -> Response:
        """
        GET response method for getting all the deployedApps for a user/developer
        """
        response, status = getDeployedApps(request)
        return make_response(response, status)
    
class GetScheduledAppsApi(Resource):
    @staticmethod
    def get() -> Response:
        """
        GET response method for getting all the scheduled Apps
        """
        response, status = getScheduledApps(request)
        return make_response(response, status)
    
class GetDeployedInProgressApi(Resource):
    @staticmethod
    def get() -> Response:
        """
        GET response method for getting all apps which are currently under deployment
        """
        response, status = getDeployInProgressApps(request)
        return make_response(response, status)
    
class DeployApp(Resource):
    @staticmethod
    def post() -> Response:
        """
        POST response method for deploying the app by the user
        """
        # baseAppId = inputData.get('baseAppId')
        # baseAppName = inputData.get('baseAppName')
        # location = inputData.get('location')
        # developer = inputData.get('developer')
        inputData = request.get_json()
        response, status = deployApp(request, inputData)
        return make_response(response, status)
    
class ScheduleApp(Resource):
    @staticmethod
    def post() -> Response:
        """
        POST response method for scheduling the app by the user
        """
        inputData = request.get_json()
        response, status = scheduleApp(request, inputData)
        return make_response
    
class StopDeployedApp(Resource):
    @staticmethod
    def post() -> Response:
        """
        POST response method for scheduling the app by the user
        """
        inputData = request.get_json()
        response, status = scheduleApp(request, inputData)
        return make_response