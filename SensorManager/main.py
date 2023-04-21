import sys
import os
from flask import Flask
import json

from flask_cors import cross_origin

# Get the absolute path of the directory containing this script
script_dir = os.path.dirname(os.path.abspath(__file__))
# Set the current working directory to the parent directory of the script directory
os.chdir(os.path.join(script_dir, '..'))
print(os.getcwd())
from kafka_consumer_utilities import get_latest_value, get_latest_n_values

app = Flask(__name__)


def read_sensor_node_JSON():
    with open('./SensorManager/sensor-topic-config.json', 'r') as f:
        data = json.load(f)
    return data


# printing readable JSON
def print_JSON(json_dict):
    print(json.dumps(json_dict, indent=4))


# latest value
@app.route('/api/sensordata/latest/<sensor_type>/<node_name>', methods=['GET'])
def get_latest_sensor_data(sensor_type, node_name):
    # consume from the producer
    sensor_node = read_sensor_node_JSON()
    partition_number = int(sensor_node['nodes-partition'][node_name])
    kafka_topic_name = sensor_node['kafka_topics'][sensor_type]
    return get_latest_value(kafka_topic_name, partition_number)


# last n values
@app.route('/api/sensordata/latest/<sensor_type>/<node_name>/<n_messages>', methods=['GET'])
# api/sensordata/latest/temperature/h105
def get_last_n_values(sensor_type, node_name, n_messages):
    sensor_node = read_sensor_node_JSON()
    partition_number = int(sensor_node['nodes-partition'][node_name])
    kafka_topic_name = sensor_node['kafka_topics'][sensor_type]
    return get_latest_n_values(kafka_topic_name, partition_number, int(n_messages))


@app.route("/home", methods=['GET'])
@cross_origin()
def home():
    return "Hi, this is Sensor Manager"


@app.route("/health", methods=['GET'])
@cross_origin()
def health():
    return "Ok"


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8050, debug=True, use_reloader=False, threaded=True)
