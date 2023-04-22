"""Data models."""
import datetime
from flask_bcrypt import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy
from main import db
import json

# The App class is a data model for applications
class DeployedApp(db.Model):
    """Data model for applications."""

    __tablename__ = "deployedapps"
    id = db.Column(db.Integer, primary_key=True)
    # baseAppId = db.Column(db.Integer, db.ForeignKey('baseApps.id'), nullable=False)
    # developer = db.Column(db.String(64), db.ForeignKey('baseApps.developer'), nullable=False)
    baseAppId = db.Column(db.Integer, nullable=False)
    developer = db.Column(db.String(64), nullable=False)
    deployedAppName = db.Column(db.String(128), index=True, unique=True, nullable=False)
    userName = db.Column(db.String(64), index=True, unique=False, nullable=False)
    url = db.Column(db.String(64), index=True, unique=True, nullable=False)
    created = db.Column(db.DateTime, default=datetime.datetime.utcnow, nullable=True)
    # baseApp = db.relationship('BaseApp', backref=db.backref('deployed_apps', lazy=True))

    def __init__(self, **kwargs):
        """
        The function takes in a dictionary of keyword arguments and assigns the values to the class
        attributes
        """
        self.baseAppId = kwargs.get('baseAppId')
        self.developer = kwargs.get('developer')
        self.deployedAppName = kwargs.get('deployedAppName')
        self.userName = kwargs.get('userName')
        self.url = kwargs.get('url')
        

    # def __repr__(self):
    #     """
    #     The __repr__ function is used to return a string representation of the object
    #     :return: The username of the user.
    #     """
    #     return "<ApplicationName {}>".format(self.appname)


