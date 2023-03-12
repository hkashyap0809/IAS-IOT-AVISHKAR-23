
docker build -f authenticator_docker_file -t authenticator_img .
docker container run -p 8081:80 authenticator_img