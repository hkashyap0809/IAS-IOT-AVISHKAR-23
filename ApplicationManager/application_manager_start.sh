
docker build -f application_manager_docker_file -t application_manager_img .
docker container run -d -p 8070:7200 application_manager_img