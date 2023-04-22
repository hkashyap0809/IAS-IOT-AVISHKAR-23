import subprocess
import re

containerId = "f709033ea5db"
connectCommand = "ssh -i ../VM-keys/VM2_key.cer azureuser@20.173.88.38 sudo".split()
commandDocker = f'''docker container stats --no-stream {containerId} --format "{{{{.CPUPerc}}}}"'''
# Run the docker container stats command and capture the output
output = subprocess.check_output(connectCommand + commandDocker.split())

print(output.decode())
print(re.sub("[^0-9.]", "", output.decode()))