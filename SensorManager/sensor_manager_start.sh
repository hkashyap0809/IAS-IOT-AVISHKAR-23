
docker build -f sensor_manager_docker_file -t sensor_manager_img .
docker container run -d -p 8090:7200 sensor_manager_img