
docker build -f authenticator_docker_file -t authenticator_img .
docker container run -d -p 8075:7200 authenticator_img