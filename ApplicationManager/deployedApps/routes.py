from flask_restful import Api
from deployedApps.views import GetDeployedAppsApi, DeployApp, ScheduleApp, GetScheduledAppsApi, GetDeployedInProgressApi, StopDeployedApp

def create_deployedapp_routes(api: Api):
    """Adds resources to the api.
    :param api: Flask-RESTful Api Object
    """
    # Get request
    api.add_resource(GetDeployedAppsApi, "/api/deployedApps/getDeployedApps/")
    # Get request
    api.add_resource(GetScheduledAppsApi, "/api/deployedApps/getScheduledApps/")
    # Get request
    api.add_resource(GetDeployedInProgressApi, "/api/deployedApps/getDeployInProgressApps/")
    # Post request
    api.add_resource(DeployApp, "/api/deployedApps/deployApp/")
    #Post request
    api.add_resource(ScheduleApp, "/api/deployedApps/scheduleApp/")
    api.add_resource(StopDeployedApp, "/api/deployedApps/stopApp/")