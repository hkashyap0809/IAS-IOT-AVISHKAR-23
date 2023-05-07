from flask import Flask,request,make_response
from flask_cors import cross_origin,CORS
import json
from email_service import trigger_email
from find_average import get_average

app = Flask(__name__)
CORS(app)

@app.route('/api/triggeremail',methods=['POST'])
@cross_origin()
def send_email():
    receiver_email = request.json['receiver-email']
    email_body = request.json['email-body']
    trigger_email(receiver_email,email_body)
    return make_response({'status':'email sent'}, 200)


@app.route('/api/average',methods=['GET'])
def get_last_average():
    sensor_data = request.args.get('sensor_array')
    sensor_data = json.loads(sensor_data)
    print(get_average(sensor_data))


@app.route('/api/activate_actuator',methods=['GET'])
def actiate_actuator():
    print("Activating actuator")

if __name__ == "__main__":
    app.run(host='0.0.0.0',port=8000)
