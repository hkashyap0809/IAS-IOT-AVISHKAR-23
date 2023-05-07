import threading
from kafka import KafkaConsumer, KafkaProducer
import json
import os
from deployedApps.models import DeployedApp
from main import db, create_app
from uuid import uuid1
from os import environ
from utils.common import generate_response
from utils.http_code import HTTP_200_OK, HTTP_201_CREATED, HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED
from baseApps.models import BaseApp
import threading
from flask import current_app

consumer = KafkaConsumer("first_topic", bootstrap_servers=['20.196.205.46:9092'])
producer = KafkaProducer(bootstrap_servers=['20.196.205.46:9092'])


# Configure Kafka producer and consumer
# producer = KafkaProducer(
#     bootstrap_servers=['20.196.205.46:9092'],
#     value_serializer=lambda v: json.dumps(v).encode('utf-8'),
#     retries=5,  # Number of times to retry a message in case of failure
#     max_in_flight_requests_per_connection=1,  # Ensure only one request is in-flight
#     acks='all',  # Wait for all replicas to acknowledge the message
# )

# consumer = KafkaConsumer("first_topic", bootstrap_servers=['20.196.205.46:9092'],
#                          value_deserializer=lambda m: json.loads(m.decode('utf-8')))


requests_m1_c, requests_m1_p = [], []  # For message 1
requests_m2_c, requests_m2_p = [], []  # For message 2
requests_m3_c, requests_m3_p = [], []  # For message 3
requests_m4_c, requests_m4_p = [], []  # For message 4
requests_m5_c, requests_m5_p = [], []  # For message 5
lock = threading.Lock()

def send(msg, c_list, p_list):
    request_id = msg['request_id']

    lock.acquire()
    if request_id in c_list:
        print("Duplicate message!")
        lock.release()
        return
    c_list.append(request_id)
    lock.release()

    print(f"Request : {msg}")

    # Check if request ID has already been processed before sending message
    lock.acquire()
    if request_id in p_list:
        print("Duplicate message!")
        lock.release()
        return
    p_list.append(request_id)
    lock.release()

    producer.send(msg['to_topic'], json.dumps(msg).encode('utf-8'))

def waitForKafkaMessage():
    app = create_app()
    with app.app_context():
        global consumer, producer
        global requests_m1_c, requests_m1_p, requests_m2_c, requests_m2_p
        for msg in consumer:
            try:
                received_message = json.loads(msg.value.decode('utf-8'))
                # received_message = msg.value
                print(received_message)
                # Deploy app native
                if 'done' in received_message['msg'] and 'deploy' in received_message['msg']:
                    appName = received_message['msg'].split()[1]
                    print(f"{appName} deployed")
                    url = received_message['msg'].split('deploy - ')[1].strip()
                    print("URL is: ", url)
                    # with db.session() as session:
                    #     deployedApp = DeployedApp.query.filter_by(deployedAppName=appName).first()
                    #     print("Deployed app is: ", deployedApp)
                    #     try:
                    #         deployedApp['status'] = 'deployed'
                    #         deployedApp['url'] = 'http://' + url
                    #         session.commit()
                    #     except Exception as e:
                    #         print(e)
                # Schedule app, just send the message to the scheduler
                elif f'done schedule app' in received_message['msg']:
                    print(received_message['msg'])
                    appName = received_message['msg'].split('$')[1]
                    print(f"Response received: App {appName} scheduled successfully")
                # App scheduled at the startTime by the deployment Manager
                elif 'done schedule deploy' in received_message['msg']:
                    splitMsg = received_message['msg'].split('$')
                    appName = splitMsg[1]
                    url = splitMsg[2]
                    # with db.session() as session:
                    #     app = DeployedApp.query.filter_by(deployedAppName=appName).first()
                    #     try:
                    #         app["url"] = "http://" + url
                    #         app["status"] = "deployed"
                    #         session.commit()
                    #     except Exception as e:
                    #         print(e)
                    #     else:
                    #         print("Schedule app response arrived: ", appName, url)
                # Time has come to deploy the scheduledApp # Producer required - message 1
                elif 'its time' in received_message['msg']:
                    # Acting as producer
                    replicatedAppName = received_message['msg'].split('$')[1]
                    uid = str(uuid1())
                    message = {
                        'to_topic': 'DeploymentManager',
                        'from_topic': 'first_topic',
                        'request_id': uid,
                        'msg': f'deploy app${replicatedAppName}'
                    }
                    send(message, requests_m1_c, requests_m1_p)
                    print("Sent deploy instruction to deployment manager")
                # Time has come to stop the scheduledApp # Producer required - message 2
                elif 'its end time' in received_message['msg']:
                    # Acting as producer
                    replicatedAppName = received_message['msg'].split('$')[1]
                    uid = str(uuid1())
                    message = {
                        'to_topic': 'DeploymentManager',
                        'from_topic': 'first_topic',
                        'request_id': uid,
                        'msg': f'stop app${replicatedAppName}'
                    }
                    send(message, requests_m2_c, requests_m2_p)
                    print("Sent end instruction to deployment manager")
                # ScheduledApp has been stopped, delete its entry from the db
                elif 'done stopped' in received_message['msg']:
                    appName=received_message['msg'].split('$')[1]
                    # app = DeployedApp.query.filter_by(deployedAppName=appName).first()
                    # with db.session() as session:
                    #     try:
                    #         if app:
                    #             db.session.delete(app)
                    #             db.session.commit()
                    #         else:
                    #             print("App does not exists")
                    #     except Exception as e:
                    #         print(e)
                    #     else:
                    #         print("Scheduled app deleted successfully")
            except Exception as e:
                print(e)
        

