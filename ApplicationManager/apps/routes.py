from flask_restful import Api
from apps.views import GetAppsApi, GetAppApi, AppUploadApi, CheckFileName

def create_app_routes(api: Api):
    """Adds resources to the api.
    :param api: Flask-RESTful Api Object
    """
    api.add_resource(GetAppsApi, "/api/app/getapps/")
    api.add_resource(GetAppApi, "/api/app/getapp/<appId>/")
    api.add_resource(AppUploadApi, "/api/app/upload/")
    api.add_resource(CheckFileName, "/api/app/checkfilename/")