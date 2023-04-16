import threading
from kafka import KafkaProducer, KafkaConsumer
import json
import os

producer = KafkaProducer(
    bootstrap_servers=['20.196.205.46:9092'],
    value_serializer=lambda v: json.dumps(v).encode('utf-8'),
    retries=5,  # Number of times to retry a message in case of failure
    max_in_flight_requests_per_connection=1,  # Ensure only one request is in-flight
    acks='all',  # Wait for all replicas to acknowledge the message
)

consumer = KafkaConsumer("ApplicationManager", bootstrap_servers=['20.196.205.46:9092'],
                        value_deserializer=lambda m: json.loads(m.decode('utf-8')))

def consume_request(msgId):
    global requests_m1_c, requests_m1_p, requests_m2_c, requests_m2_p
    global consumer, producer
    for message in consumer:
        request_data = message.value
        if "done" in request_data["msg"] and msgId == request_data["request_id"]:
            return request_data["msg"]
