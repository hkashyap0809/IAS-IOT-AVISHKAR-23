
        docker stop fault_manager_container
        docker rm fault_manager_container
        docker build -f fault_manager_docker_file -t fault_manager_img .
        docker container run -d --name fault_manager_container -p 8070:8050 fault_manager_img
    