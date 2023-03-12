
docker build -f node_manager_docker_file -t node_manager_img .
docker container run -p 8083:80 node_manager_img