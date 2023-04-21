"""Data models."""
import datetime
from flask_bcrypt import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy
from main import db
import json

# The App class is a data model for applications
class App(db.Model):
    """Data model for applications."""

    __tablename__ = "apps"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=False, nullable=False)
    appname = db.Column(db.String(64), index=True, unique=True, nullable=False)
    created = db.Column(db.DateTime, default=datetime.datetime.utcnow, nullable=True)
    url = db.Column(db.String(128), index=True, nullable=True)

    def __init__(self, **kwargs):
        """
        The function takes in a dictionary of keyword arguments and assigns the values to the class
        attributes
        """
        self.username = kwargs.get("username")
        self.appname = kwargs.get("appname")
        if(kwargs.get("url")):
            self.url = kwargs.get("url")

    # def __repr__(self):
    #     """
    #     The __repr__ function is used to return a string representation of the object
    #     :return: The username of the user.
    #     """
    #     return "<ApplicationName {}>".format(self.appname)
    
class AppEncoder(json.JSONEncoder):
    """Custom encoder for serializing App instances to JSON"""

    def default(self, obj):
        if isinstance(obj, App):
            return {"id": obj.id, "username": obj.username, "appname": obj.appname}
        return super().default(obj)


