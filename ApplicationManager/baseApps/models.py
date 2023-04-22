"""Data models."""
import datetime
from flask_bcrypt import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy
from main import db
import json

# The App class is a data model for applications
class BaseApp(db.Model):
    """Data model for applications."""

    __tablename__ = "baseapps"
    id = db.Column(db.Integer, primary_key=True)
    appName = db.Column(db.String(64), index=True, unique=True, nullable=False)
    developer = db.Column(db.String(64), index=True, unique=False, nullable=False)
    status = db.Column(db.String(64), index=True, unique=False, default="uploaded", nullable=False)
    created = db.Column(db.DateTime, default=datetime.datetime.utcnow, nullable=True)

    def __init__(self, **kwargs):
        """
        The function takes in a dictionary of keyword arguments and assigns the values to the class
        attributes
        """
        self.appName = kwargs.get("appName")
        self.developer = kwargs.get("developer")
        

    # def __repr__(self):
    #     """
    #     The __repr__ function is used to return a string representation of the object
    #     :return: The username of the user.
    #     """
    #     return "<ApplicationName {}>".format(self.appname)


