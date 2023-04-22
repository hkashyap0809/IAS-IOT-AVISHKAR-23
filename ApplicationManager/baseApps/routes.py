from flask_restful import Api
from baseApps.views import GetAppsApi, AppUploadApi, CheckFileName

def create_baseapp_routes(api: Api):
    """Adds resources to the api.
    :param api: Flask-RESTful Api Object
    """
    # Get request
    api.add_resource(GetAppsApi, "/api/baseApp/getapps/")
    # Post request
    api.add_resource(AppUploadApi, "/api/baseApp/upload/")
    # Post request
    api.add_resource(CheckFileName, "/api/baseApp/checkfilename/")
