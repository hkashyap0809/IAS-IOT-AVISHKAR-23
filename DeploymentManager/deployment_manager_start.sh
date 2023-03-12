
docker build -f deployment_manager_docker_file -t deployment_manager_img .
docker container run -p 8082:80 deployment_manager_img