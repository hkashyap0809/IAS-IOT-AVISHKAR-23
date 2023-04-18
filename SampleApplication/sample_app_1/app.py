# flask app
from flask import Flask
import json
import requests

app = Flask(__name__)

def get_all_sensors():
    all_sensors = requests.get('http://localhost:8000/api/sensors')
    return all_sensors







if __name__ == "__main__":
    print(get_all_sensors().json())
    app.run(host='localhost',port=9000)
