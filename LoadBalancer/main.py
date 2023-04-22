from flask import Flask
from flask_cors import cross_origin
from flask import request
import threading
from LoadBalancer import LoadBalancer

app = Flask(__name__)

loadBalancerIp = "20.21.102.175"
nginxPath = "/etc/nginx"


@app.route("/registerApp", methods=['GET'])
@cross_origin()
def registerApp():
    """
    The name of first (original) container of the app should preferably be appName_instance_1. Not following this in
    no way affect the functioning of the code
    """
    appName = request.args.get("appName")
    imageName = request.args.get("imageName")
    vmIp = request.args.get("vmIp")
    containerPort = request.args.get("containerPort")
    hostPort = request.args.get("hostPort")
    containerId = request.args.get("containerId")
    lbVmName = request.args.get("lbVmName")

    lbb = LoadBalancer()
    return lbb.registerApp(appName, imageName, vmIp, int(containerPort), int(hostPort), containerId, lbVmName)


if __name__ == "__main__":
    lb = LoadBalancer()
    thread = threading.Thread(target=lb.balance, args=("VM1",))
    thread.start()
    app.run(host='0.0.0.0', port=7200, debug=True, threaded=True)
    print("The server has started")
    thread.join()
