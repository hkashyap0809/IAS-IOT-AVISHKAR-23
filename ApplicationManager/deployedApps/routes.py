from flask_restful import Api
from deployedApps.views import GetDeployedAppsApi, DeployApp

def create_deployedapp_routes(api: Api):
    """Adds resources to the api.
    :param api: Flask-RESTful Api Object
    """
    # Get request
    api.add_resource(GetDeployedAppsApi, "/api/deployedApps/getDeployedApps/")
    # Post request
    api.add_resource(DeployApp, "/api/deployedApps/deployApp/")