docker build -f deployment_manager_docker_file -t deployment_manager_img .
docker container run -d -p 8070:8050 deployment_manager_img