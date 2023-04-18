import requests 
# trigger_email = requests.get("localhost:8001/api/triggeremail/",['hkashyap0809@gmail.com', 'The average of last values is '], 
# analyze_prev_data = requests.get("localhost:8001/api/analyzedata/",[10], 
#                                  requests.get("localhost:8000/api/sensordata/latest/",['temperature', 'h105'])
# )
# )
# val = requests.get("http://localhost:8001/api/analyzedata")
# print(val.text)

trigger_email = requests.get("http://localhost:8001/api/triggeremail",
                             headers={
    'receiver-email':'hkashyap0809@gmail.com', 
    'email-body':'The average of last values is ' ,
    'value': requests.get("http://localhost:8001/api/analyzedata").text}) 

