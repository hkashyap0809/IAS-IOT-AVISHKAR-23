docker build -f deployment_manager_docker_file -t deployment_manager_img .
docker container run -d -p 9000:7200 deployment_manager_img