import flask

from healthCheck import get_node_health, monitor_nodes, delete_logs
from flask import Flask
from flask_cors import cross_origin

app = Flask(__name__)


@app.route("/nodemgr/get-deploy-node", methods=['GET'])
@cross_origin()
def get_deploy_node():
    res = get_node_health()
    return flask.jsonify(res)


@app.route("/nodemgr/log", methods=['GET'])
@cross_origin()
def get_log():
    monitor_nodes()
    pass


@app.route("/nodemgr/delete-old-logs", methods=['DELETE'])
@cross_origin()
def delete_old_logs():
    delete_logs()
    return "Success"


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=7200, debug=True, threaded=True)
