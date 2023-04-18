
        docker stop workflow_manager_container
        docker rm workflow_manager_container
        docker build -f workflow_manager_docker_file -t workflow_manager_img .
        docker container run -d --name workflow_manager_container -p 8090:8050 workflow_manager_img
    