import threading
from kafka import KafkaConsumer
import json
import os
from deployedApps.models import DeployedApp
from main import db

consumer = KafkaConsumer("ApplicationManager", bootstrap_servers=['20.196.205.46:9092'],
                        value_deserializer=lambda m: json.loads(m.decode('utf-8')))
        
def saveScheduledAppKafka():
    global consumer
    for msg in consumer:
        received_message = json.loads(msg.value.decode('utf-8'))
        if 'done schedule deploy' in received_message['msg']:
            splitMsg = received_message['msg'].split('-')
            appName = splitMsg[1]
            url = splitMsg[2]
            with db.session() as session:
                app = DeployedApp.query.filter_by(deployedAppName=appName).first()
                try:
                    app.url = "http://" + url
                    session.commit()
                except Exception as e:
                    print(e)
            print("Schedule app response arrived: ", appName, url)

