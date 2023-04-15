docker build -f application_manager_docker_file -t application_manager_img .
docker container run -d -p 8060:8050 application_manager_img