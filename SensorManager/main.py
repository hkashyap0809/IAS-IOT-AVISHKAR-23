import sys
import os
from flask import Flask,request,abort,jsonify,make_response
from flask_cors import cross_origin
import json
from kafka_consumer_sensor import get_latest_node_data,get_latest_n_node_data
from json_utilities import read_JSON,FOLDER_PATH,print_JSON

# Get the absolute path of the directory containing this script
script_dir = os.path.dirname(os.path.abspath(__file__))
# Set the current working directory to the parent directory of the script directory
os.chdir(os.path.join(script_dir, '..'))
print(os.getcwd())

app = Flask(__name__)

# SENSOR REGISTRY APIs - TODO later
@app.route('/api/sensor/register/vertical',methods=['POST'])
def vertical_registration():
    req_body = request.get_json()
    vertical = req_body['vertical']
    node_name = req_body['node_name']
    descriptor = req_body['descriptor']
    print(descriptor)
    return "vertical registration"

# @app.route('/api/sensor/register/node',methods=['POST'])
# def node_registration():
#     return "node registration"

# @app.route('/api/sensor/register/sensor',methods=['POST'])
# def sensor_registration():
#     return "sensor registration"
# message = "Bad request. Please check your input."
#         response = {
#             "status": 400,
#             "message": message
#         }
#         return make_response(jsonify(response), 400)

@app.route('/api/sensor/location/<vertical>',methods=['GET'])
def get_vertical_vise_location(vertical):
    vertical_location = read_JSON(FOLDER_PATH,'vertical_location.json')
    if vertical in vertical_location:
        return jsonify(vertical_location[vertical])
    else:
        return jsonify({'statusCode':'400','message':'Invalid Vertical'})

# LOCATION VALIDATION AND SENSOR BINDING API
@app.route('/api/sensor/validate',methods=['POST'])
def validate_binding():
    request_body = request.get_json()
    # entered by the user
    location = request_body['location']
    vertical = request_body['application-type']
    sensors = request_body['sensors']
    node = vertical+'-'+location
    location_node = read_JSON(FOLDER_PATH,'location_node.json')
    verticals_JSON = read_JSON(FOLDER_PATH,'verticals.json')
    print(node)
    print_JSON(location_node[location])
    try:
        if node in location_node[location]:
            for sensor in sensors:
                if sensor not in verticals_JSON[vertical]:
                    print('senor not present')
                    return jsonify({'statusCode':'400','message':"This location does not have this sensor"})
            return jsonify({'statusCode':'200','message':'Validated and sensor binded'}) 
        else:
            print('wrong node')
            return jsonify({'statusCode':'400','message':"This location does not have this sensor"})
    except Exception as e:
        print("Exception occured ",e)
        abort(400,'Some exception occurred')


# SENSOR DATA APIs
@app.route('/api/sensor/data/latest/<location>/<vertical>',methods=['GET'])
def node_data(location,vertical):
    nodename = vertical+'-'+location
    nodes = read_JSON(FOLDER_PATH,'nodes.json')
    node_partition = read_JSON(FOLDER_PATH,'node_partition.json')
    try :
        if nodename in nodes:
            n_last = request.args.get('last')
            topic_name = node_partition[nodename]['topic-name']
            partition_number = int(node_partition[nodename]['partition-number'])
            if n_last > 1 :
                latest_data = get_latest_n_node_data(topic_name,partition_number,n_last)
                latest_data = latest_data.decode('utf-8')
                return json.loads(latest_data)
            else:
                latest_data = get_latest_node_data(topic_name,partition_number)
                latest_data = get_latest_node_data(topic_name,partition_number)
                return json.dumps(latest_data)
        else:
            return json.dumps({'statusCode':'400','message':'node does not exist'})
    except Exception as e:
        print("Exception occurred ", e)
        return json.dumps({'statusCode':'400','message':'some exception occurred'})

# @app.route('/api/sensor/data/latest/<nodename>/<sensor>',methods=['GET'])
# def sensor_node_data(nodename,sensor):
#     try :
#         if nodename in nodes and sensor in sensors:
#             n_last = request.args.get('last')
#             if n_last:
#                 return json.dumps({'statusCode':'200','message':'last n data'})
#             else:
#                 return json.dumps({'statusCode':'200','message':'last data'})
#         else:
#             return json.dumps({'statusCode':'400','message':'error'})
#     except:
#         return json.dumps({'statusCode':'400','message':'error'})

@app.route("/home", methods=['GET'])
@cross_origin()
def home():
    return "Hi, this is Sensor manager"


@app.route("/health", methods=['GET'])
@cross_origin()
def health():
    return "Ok"


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8050, debug=True, use_reloader=False, threaded=True)
