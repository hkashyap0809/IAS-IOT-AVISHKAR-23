# IAS-IOT-AVISKAR-23

## Important commands

### Copy from local machine to VM
scp -r -i {VM_KEY_PATH} {SOURCE_FOLDER_PATH} {VM_USERNAME}@{VM_IP_ADDRESS}:{DESTINATION_PATH}

### Permission Denied Error
chmod 0600 {VM_KEY_PATH}

### SSH to VM
cd IAS-IOT-AVISHKAR-23
ssh -i {VM_KEY_PATH} {VM_USERNAME}@{VM_IP_ADDRESS}

ssh -i VM-keys/azure_VM1_key.pem vmadmin@13.81.42.121
ssh -i VM-keys/azure_VM2_key.pem azureuser@40.115.28.100
ssh -i VM-keys/azure_VM3_key.pem azureuser@51.144.255.78

### TO RUN PLATFORM INITIALIZER
python3 PlatformInitializer/main.py

### Install the important dependencies
pip install pymongo
pip install requests
pip install flask
pip install kafka-python
pip install psycopg2
if above commnad give error pip install psycopg2-binary

### For fetching data from ONEM2M server
###### start the server
cd ONEM2M; ./start_om2m_server.sh
###### start data generator.py
python3 ONEM2M/data_generator.py
###### start the fetching script from ONEM2M server
python3 SensorManager/dataSend.py
###### start the flask application
python3 SensorManager/main.py 


#### Sensor APIs

### To fetch last n values of a node of specific sensor type
GET localhost:8000/api/sensordata/latest/<sensor_type>/<nodename>/<n_messages>
### To fetch the latest value of a node of specific sensor type
GET localhost:8000/api/sensordata/latest/<sensor_type>/<nodename>

#### .env file should have these fields
DB_URL=
DB_USER=
DB_PASSWORD=
DB_NAME=
SECRET_KEY=
SQLALCHEMY_DATABASE_URI=
SQLALCHEMY_DATABASE_URII=
FLASK_ENV=
DEPLOYED_APPS_CONTAINER=
AZURE_BLOB_CONN_STRING=
KAFKA_SERVER=
BASE_APPS_CONTAINER=
