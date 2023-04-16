from flask import Flask,request,make_response
import json
from email_service import *
from find_average import *

app = Flask(__name__)

@app.route('/api/triggeremail',methods=['GET'])
def send_email():
    receiver_email = request.headers.get('receiver-email')
    email_body = request.headers.get('email-body')
    value = request.headers.get('value')
    trigger_email(receiver_email,email_body,value)
    return make_response({'status':'email sent'}, 200)


@app.route('/api/average',methods=['GET'])
def get_last_average():
    sensor_data = request.args.get('sensor_array')
    sensor_data = json.loads(sensor_data)
    print(get_average(sensor_data))


@app.route('api/activate_actuator',methods=['GET'])
def actiate_actuator():
    print("Activating actuator")

if __name__ == "__main__":
    app.run(host='localhost',port=8000)

# # sending the request

# import requests
# import json

# url = "http://localhost:5000/example"
# data = [
#     {"name": "John", "age": 30, "city": "New York", "country": "USA"},
#     {"name": "Mary", "age": 25, "city": "London", "country": "UK"},
#     {"name": "Bob", "age": 40, "city": "Paris", "country": "France"}
# ]
# params = {
#     "data": json.dumps(data)
# }

# response = requests.get(url, params=params)

# print(response.content)


# fetching fromm the body
# from flask import Flask, request, jsonify

# app = Flask(__name__)

# @app.route('/example', methods=['GET'])
# def example():
#     data_str = request.args.get('data')
#     data = json.loads(data_str)

#     # Do something with the data
#     ...

#     return jsonify({'message': 'Data received successfully'})
