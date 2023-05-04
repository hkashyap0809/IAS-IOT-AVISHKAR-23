"""App entry point."""
"""Initialize Flask app."""

import os
from flask import Flask
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import threading
from kafkaConsumer import saveScheduledAppKafka

db = SQLAlchemy()


def create_app():
    """Construct the core application."""
    app = Flask(__name__, instance_relative_config=False)
    CORS(app)

    app.config["UPLOAD_FOLDER"] = "static/uploads"
    app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024
    app.config.from_object("config.Config")

    api = Api(app=app)

    from baseApps.routes import create_baseapp_routes
    from deployedApps.routes import create_deployedapp_routes
    # from apps.routes import create_app_routes

    create_baseapp_routes(api=api)
    create_deployedapp_routes(api=api)
    # create_app_routes(api=api)

    db.init_app(app)

    with app.app_context():
        db.create_all()  # Create database tables for our data models
        return app


if __name__ == "__main__":
    app = create_app()
    thread = threading.Thread(target=saveScheduledAppKafka)
    app.run(host="0.0.0.0", port=5001)
    thread.join()
