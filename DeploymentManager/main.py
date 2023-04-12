import threading
from flask import Flask
from kafka import KafkaProducer, KafkaConsumer
import json

app = Flask(__name__)

# Configure Kafka producer and consumer
producer = KafkaProducer(
    bootstrap_servers=['20.196.205.46:9092'],
    value_serializer=lambda v: json.dumps(v).encode('utf-8'),
    retries=5,  # Number of times to retry a message in case of failure
    max_in_flight_requests_per_connection=1,  # Ensure only one request is in-flight
    acks='all',  # Wait for all replicas to acknowledge the message
)

consumer = KafkaConsumer("DeploymentManager", bootstrap_servers=['20.196.205.46:9092'],
                         value_deserializer=lambda m: json.loads(m.decode('utf-8')))

requests_m1_c, requests_m1_p, requests_m2_c, requests_m2_p = [], [], [], []
lock = threading.Lock()


def send(request_data, msg, c_list, p_list):
    request_id = request_data['request_id']

    lock.acquire()
    if request_id in c_list:
        print("Duplicate message!")
        lock.release()
        return
    c_list.append(request_id)
    lock.release()

    print(f"Request : {request_data}")

    # Check if request ID has already been processed before sending message
    lock.acquire()
    if request_id in p_list:
        print("Duplicate message!")
        lock.release()
        return
    p_list.append(request_id)
    lock.release()

    producer.send(msg['to_topic'], msg)


# Define the function for consuming requests and sending responses
def consume_requests():
    global requests_m1_c, requests_m1_p, requests_m2_c, requests_m2_p
    global consumer, producer
    for message in consumer:
        request_data = message.value

        # M1 - message from app manager to deploy
        if request_data['msg'] == "deploy app":
            msg = {
                'to_topic': 'NodeManager',
                'from_topic': 'DeploymentManager',
                'request_id': request_data['request_id'],
                'msg': 'give best node'
            }
            send(request_data, msg, requests_m1_c, requests_m1_p)

        # M2 - message from node manager with ip and port
        if "ansnode$" in request_data['msg']:
            res = json.loads(request_data['msg'].split("$")[1].replace('\'', '"'))
            ip_deploy = "20.21.102.175"
            port_deploy = res["port"]
            dir = "App-1"
            print(ip_deploy, port_deploy, dir)

            msg = {
                'to_topic': 'first_topic',
                'from_topic': 'DeploymentManager',
                'request_id': request_data['request_id'],
                'msg': f'done {dir} deploy - {ip_deploy}:{port_deploy}'
            }
            send(request_data, msg, requests_m2_c, requests_m2_p)


if __name__ == "__main__":
    thread = threading.Thread(target=consume_requests)
    thread.start()
    app.run(host='0.0.0.0', port=7200, debug=True)
    thread.join()
