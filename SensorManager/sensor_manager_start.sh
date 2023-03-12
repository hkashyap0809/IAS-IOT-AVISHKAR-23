
docker build -f sensor_manager_docker_file -t sensor_manager_img .
docker container run -p 8084:80 sensor_manager_img