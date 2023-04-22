import subprocess
import re

connectCommand = "ssh -i ../VM-keys/VM2_key.cer azureuser@20.173.88.38".split()
commandDocker = f'''sudo docker run --name testApp2_instance2 -d -p 39000:7200 test_app2_image'''
# Run the docker container stats command and capture the output
output = subprocess.check_output(connectCommand + commandDocker.split())

print(output.decode())