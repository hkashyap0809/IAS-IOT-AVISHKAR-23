import requests
import json

# import requests
# from requests.adapters import Retry



# # Create a Retry object with a higher max_retries value
# retry = Retry(total=500, backoff_factor=0.1, status_forcelist=[ 500, 502, 503, 504 ])
# session = requests.Session()
# adapter = requests.adapters.HTTPAdapter(max_retries=retry)
# session.mount('http://', adapter)
# session.mount('https://', adapter)

urls = dict()
urls["sensor_data"] = "http://localhost:8000/api/sensordata/latest/"
urls["node_data"] = "http://localhost:8000/api/nodedata/latest/"
urls["analyze_prev_data"] = "http://localhost:8000/api/analyzedata"
urls["trigger_email"] = "http://localhost:8000/api/sensordata/latest/"


def generate_python_code(api_list, api_name):
    api = None
    for api_info in api_list:
        if api_info["api_name"] == api_name:
            api = api_info
            break
    
    if api is None:
        raise ValueError(f"No API found with name '{api_name}'")

    dependencies = api["dependency"]
    headers = api["headers"]

    # Base case: if no dependencies, return the API call
    if not dependencies:
        str=f"requests.get(\"{urls[api_name]}\""
        if len(headers) !=0:
            str =str+f",{headers})"
        else:
            str = str+")"
        return str 

    # Recursive case: generate code for calling dependent APIs and concatenate the results
    code = []
    for dependency in dependencies:
        code.append(generate_python_code(api_list, dependency))
    dependencies_code = " , ".join(code)

    # Add the current API call with concatenated dependencies code
    return f"{api_name} = requests.get(\"{urls[api_name]}\",headers={headers}, 'value':{dependencies_code})"

def generate(api_list, api_name , api_content,last_api ):
   
    dependencies = api_content["dependency"]

    if(len(dependencies) == 0):
        return requests.get(urls[api_name],params = api_content["params"])
    
    
    own_api = ""
   
    for dependency in dependencies:
        api = dependency.split(":")
        result = generate(api_list,api[0],api_list[api[0]],last_api)
        print(api,result)
       
        result = {"temp":"10","email":"hsahuja"}
        result = result[api[1]]
        

        api_content["params"][api[1]] = result
       
        
    own_api = f"requests.get(\"{urls[api_name]}\""
    own_api += ",params="+str(api_content["params"])
    own_api += ")"
    print(own_api)

    if(last_api != api_name):
        return requests.get(urls[api_name],params=str(api_content["params"]))
        
    else:
        # print(own_api)
        return own_api

    # Base case: if no dependencies, return the API call
    # if not dependencies:
    #     str=f"requests.get(\"{urls[api_name]}\""
    #     if len(headers) !=0:
    #         str =str+f",{headers})"
    #     else:
    #         str = str+")"
    #     return str 

    # Recursive case: generate code for calling dependent APIs and concatenate the results
    # code = []
    # for dependency in dependencies:
    #     code.append(generate_python_code(api_list, dependency))
    # dependencies_code = " , ".join(code)

    # # Add the current API call with concatenated dependencies code
    # return f"{api_name} = requests.get(\"{urls[api_name]}\",headers={headers}, 'value':{dependencies_code})"



with open('./workflow.json', 'r') as file:
    api_list =  json.load(file)

last_key = list(api_list.keys())[-1]
last_value = api_list[last_key]

generate(api_list,last_key,last_value,last_key)

# Get the final API name
# final_api_name = api_list[-1]["api_name"]
# print(final_api_name)
# Generate Python code for calling the final API with dependencies
# final_output = generate_python_code(api_list, final_api_name)

# with open('./WorkflowServices/new_generated.py', 'w') as file:
#     file.write("import requests \n")
#     file.write(final_output)





"""

# Define the API URLs and parameters
api_dict = {
    "Temperature": {
        "url": "https://api.example.com/temperature",
        "params": ["par1", "par2"]
    },
    "Humidity": {
        "url": "https://api.example.com/humidity",
        "params": ["par1"]
    },
    "Notification": {
        "url": "https://api.example.com/notification",
        "params": ["par1", "par2"]
    }
}




"""
# requests.get("http://localhost:8000/api/sensordata/latest/"OrderedDict([('node_name', 'AQ'), ('sensor_type', '<enter valid sensor>'), ('last_n', 1), ('attr1', 'requests.get("http://localhost:8000/api/nodedata/latest/)"')]))

# requests.get("http://localhost:8000/api/sensordata/latest/"{'node_name': 'AQ', 'sensor_type': '<enter valid sensor>', 'last_n': 1, 'attr1': 'requests.get("http://localhost:8000/api/nodedata/latest/)"'})

# requests.get("http://localhost:8000/api/sensordata/latest/",params={'node_name': 'AQ', 'sensor_type': '<enter valid sensor>', 'last_n': 1, 'attr1': 'requests.get("http://localhost:8000/api/nodedata/latest/)"'})


# requests.get("http://localhost:8000/api/sensordata/latest/",params={'node_name': 'AQ', 'sensor_type': '<enter valid sensor>', 'last_n': 1, 'attr1': 'requests.get("http://localhost:8000/api/nodedata/latest/)".json()[attr1]'})


# requests.get("http://localhost:8000/api/sensordata/latest/",params={'node_name': 'AQ', 'sensor_type': '<enter valid sensor>', 'last_n': 1, 'attr1': 'requests.get("http://localhost:8000/api/nodedata/latest/").json()[attr1]'})