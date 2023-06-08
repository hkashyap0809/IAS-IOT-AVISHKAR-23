# flask app
from flask import Flask,render_template,jsonify, request, Response, redirect, url_for
from flask_cors import CORS
import json
import requests
import random

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage

app = Flask(__name__,template_folder='./')
CORS(app)

#threshold values
threshold = {"SR-AQ": {"Temperature" : [20, 30], "CO2" : [0, 1000], "Relative Humidity" : [40, 60]},
             "SR-OC": {"Temperature" : [20, 30]},
             "SR-AC": {"Gas Total Power" : [9, 14]}}

f1_fan_ac_status = "ON"
f2_fan_status, f2_AC_status, f2_light_status = "ON", "ON", "ON"
mail_count = 0


def trigger_email(receiver_email,email_body):
    print("SENDING EMAIL")
    print(receiver_email,email_body)
    payload={}
    payload['receiver-email'] = receiver_email
    payload['email-body'] = email_body
    # 20.21.102.175:18110
    send_email=requests.post("http://20.21.102.175:8110/api/triggeremail",json=payload)
    print(send_email)
    print("EMAIL SENT")


def random_val(start,end):
    random_number = random.randint(start, end)
    return random_number

def stream_template(template_name, **context):
    app.update_template_context(context)
    t = app.jinja_env.get_template(template_name)
    rv = t.stream(context)
    rv.enable_buffering(5)
    return rv

def read_JSON(file_name):
    with open(file_name, 'r') as f:
            data = json.load(f)
    return data

def get_random_data(x):
    random_sensor_data={}
    random_sensor_data['AQ'] = {
            "AQI":random_val(10,15),
            "PM10":random_val(10,15),
            "AQL":random_val(10,15)
        }
    random_sensor_data['SR-AQ'] = {
            "Temperature":random_val(10,30),
            "CO2":random_val(1,5),
            "Relative Humidity":random_val(15,30)
    }
    random_sensor_data['SR-AC']={"Gas Total Power":random_val(10,15)}
    random_sensor_data['SR-OC']={"Temperature":random_val(20,35)}
    return random_sensor_data[x]

def get_sensor_data():
    app_json = read_JSON('./app.json')
    location = app_json['location']
    sensorTypes = app_json['sensorTypes']
    sensor_data={}

    for application_entity in location:
        sensor_data[application_entity]=[]
        for node in location[application_entity]:
            sensor = sensorTypes[application_entity]
            sensor = ",".join(sensor)
            print(sensor,node,application_entity)
            data = requests.get("http://20.173.88.141:8060/api/sensor/data/latest/"+node+"/"+application_entity+"?last=1&sensor="+sensor).json()
            data=data[0]
            sensor_data[application_entity].append(data)
    
    print("API",sensor_data)
    return sensor_data


@app.route("/")
def index():
    return render_template("./index.html")

@app.route('/api/data')
def get_api_data():
    app_json = read_JSON('./app.json')
    location = app_json['location']

    sensorTypes = app_json['sensorTypes']
    application_entities = [x for x in sensorTypes]
    
    #sensor_data = get_random_data()
    receiver_email = app_json['userEmail']

    sensor_data = {x:[] for x in application_entities}

    for app_entity in application_entities:
        for app_loc in location[app_entity]:
            # API call for app_entity at app_loc
            sensor_data[app_entity].append(get_random_data(app_entity))
    print("RANDOM DATA")
    print(sensor_data)
    res={}

    def feature_1():
        f1=""
        global f1_fan_ac_status
        if f1_fan_ac_status == "ON" and sensor_data["SR-AQ"][0]["CO2"] > threshold["SR-AQ"]["CO2"][1] and sensor_data["SR-AQ"][1]["CO2"] > threshold["SR-AQ"]["CO2"][1] and sensor_data["SR-OC"][0]["Temperature"] > threshold["SR-OC"]["Temperature"][1] and sensor_data["SR-OC"][1]["Temperature"] > threshold["SR-OC"]["Temperature"][1]:
            # print("Turn Fans and AC off.")
            f1+="Turn Fans and AC off."
            f1_fan_ac_status = "OFF"
        elif f1_fan_ac_status == "OFF" and sensor_data["SR-AQ"][0]["CO2"] <= threshold["SR-AQ"]["CO2"][1] and sensor_data["SR-AQ"][1]["CO2"] <= threshold["SR-AQ"]["CO2"][1] and sensor_data["SR-OC"][0]["Temperature"] <= threshold["SR-OC"]["Temperature"][1] and sensor_data["SR-OC"][1]["Temperature"] <= threshold["SR-OC"]["Temperature"][1]:
            # print("Turn Fans and AC on.")
            f1+="Turn Fans and AC on."
            f1_fan_ac_status = "ON"
        
        return f1
    
    def feature_2():
        global f2_fan_status, f2_AC_status, f2_light_status
        msg = ""
        if f2_fan_status=="ON" and sensor_data["SR-AQ"][0]["CO2"] > threshold["SR-AQ"]["CO2"][1]:
            msg += "Turn fans off \n"
            f2_fan_status = "OFF"
        elif f2_fan_status=="OFF" and sensor_data["SR-AQ"][0]["CO2"] <= threshold["SR-AQ"]["CO2"][1]:
            msg += "Turn fans on \n"
            f2_fan_status = "ON"

        if f2_light_status=="ON" and sensor_data["SR-OC"][0]["Temperature"] > threshold["SR-OC"]["Temperature"][1]:
            msg += "Turn lights off \n"
            f2_light_status = "OFF"
        elif f2_light_status=="OFF" and sensor_data["SR-OC"][0]["Temperature"] <= threshold["SR-OC"]["Temperature"][1]:
            msg += "Turn lights on \n"
            f2_light_status = "ON"
        
        if f2_AC_status=="ON" and sensor_data["SR-AC"][0]["Gas Total Power"] > threshold["SR-AC"]["Gas Total Power"][1]:
            if sensor_data["SR-AQ"][0]["CO2"] > threshold["SR-AQ"]["CO2"][1] or sensor_data["SR-OC"][0]["Temperature"] > threshold["SR-OC"]["Temperature"][1]:
                msg += "Turn AC off"
                f2_AC_status = "OFF"
        elif f2_AC_status=="OFF" and sensor_data["SR-AC"][0]["Gas Total Power"] <= threshold["SR-AC"]["Gas Total Power"][1]:
            msg += "Turn AC on"
            f2_AC_status = "ON"
        return (msg)
    
    
    res["f1"]=feature_1()
    res["f2"]=feature_2()
    # print(sensor_data)
    if int(sensor_data['SR-AQ'][0]['Temperature']) > 28 or int(sensor_data['SR-AQ'][1]['Temperature']) >28 :
       message = "AC turned ON. Temperature is greater than 28"
       trigger_email(receiver_email,message)
    elif int(sensor_data['SR-AQ'][0]['Temperature']) < 12 or int(sensor_data['SR-AQ'][0]['Temperature']) < 12 :
       message = "AC turned OFF. Temperature is less than 12"
       trigger_email(receiver_email,message)
    
    data={}
    data['result']=res
    data['sensor_data']=sensor_data
    return jsonify(data)
    

if __name__ == "__main__":
    app.run(host='0.0.0.0',port=7700)


