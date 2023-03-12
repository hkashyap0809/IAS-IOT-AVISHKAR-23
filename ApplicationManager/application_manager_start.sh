
docker build -f application_manager_docker_file -t application_manager_img .
docker container run -p 8080:80 application_manager_img