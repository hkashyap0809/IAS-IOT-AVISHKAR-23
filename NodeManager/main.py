import flask

from healthCheck import get_node_health
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
    pass


@app.route("/nodemgr/delete-old-logs", methods=['DELETE'])
@cross_origin()
def delete_old_logs():
    pass


if __name__ == "__main__":
    get_node_health()
    print("Hi, this is NodeManager")

