from flask import Flask,request
import json
from kafka_consumer_sensor import *
from json_utilities import *
app = Flask(__name__)
 

nodes = read_JSON(FOLDER_PATH,'nodes.json')
sensors = read_JSON(FOLDER_PATH,'unique_sensors.json')
verticals = read_JSON(FOLDER_PATH,'verticals.json')
vertical_partition = read_JSON(FOLDER_PATH,'verticals.json')


# SENSOR REGISTRY APIs
@app.route('/api/sensor/register/vertical',methods=['POST'])
def vertical_registration():
    req_body = request.get_json()
    vertical = req_body['vertical']
    node_name = req_body['node_name']
    descriptor = req_body['descriptor']
    print(descriptor)
    return "vertical registration"

@app.route('/api/sensor/register/node',methods=['POST'])
def node_registration():
    return "node registration"

@app.route('/api/sensor/register/sensor',methods=['POST'])
def sensor_registration():
    return "sensor registration"

# SENSOR DATA APIs

@app.route('/api/sensor/data/latest/<nodename>',methods=['GET'])
def node_data(nodename):
    try :
        if nodename in nodes:
            n_last = request.args.get('last')
            if n_last:
                latest_data = get_latest_n_node_data()
                return json.dumps({'statusCode':'200','message':'last n data'})
            else:
                latest_data = get_latest_node_data()
                return json.dumps({'statusCode':'200','message':'last data'})
        else:
            return json.dumps({'statusCode':'400','message':'error'})
    except:
        return json.dumps({'statusCode':'400','message':'error'})

@app.route('/api/sensor/data/latest/<nodename>/<sensor>',methods=['GET'])
def sensor_node_data(nodename,sensor):
    try :
        if nodename in nodes and sensor in sensors:
            n_last = request.args.get('last')
            if n_last:
                return json.dumps({'statusCode':'200','message':'last n data'})
            else:
                return json.dumps({'statusCode':'200','message':'last data'})
        else:
            return json.dumps({'statusCode':'400','message':'error'})
    except:
        return json.dumps({'statusCode':'400','message':'error'})


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8050, debug=True, use_reloader=False, threaded=True)
