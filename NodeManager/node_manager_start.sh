
docker build -f node_manager_docker_file -t node_manager_img .
docker container run -d -p 8080:7200 node_manager_img