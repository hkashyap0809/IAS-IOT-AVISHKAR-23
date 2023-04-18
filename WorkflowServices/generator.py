import requests
import json

urls = dict()
# urls["sensor"] = "http://localhost:8000/api/sensordata/latest/"
urls["analyze_prev_data"] = "http://localhost:8001/api/analyzedata"
urls["trigger_email"] = "http://localhost:8001/api/triggeremail"


def generate_python_code(api_list, api_name):
    print("11",api_name)
    print("12",api_list)
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



with open('./WorkflowServices/workflow.json', 'r') as file:
    api_list = json.load(file)

# Get the final API name
final_api_name = api_list[-1]["api_name"]
# print(final_api_name)
# Generate Python code for calling the final API with dependencies
final_output = generate_python_code(api_list, final_api_name)

with open('./WorkflowServices/new_generated.py', 'w') as file:
    file.write("import requests \n")
    file.write(final_output)





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