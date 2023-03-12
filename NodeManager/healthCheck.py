import json
from azure.identity import ClientSecretCredential
from azure.mgmt.compute import ComputeManagementClient
from azure.mgmt.compute.models import InstanceViewTypes, InstanceViewStatus
import psutil
from Utilities import sql_query_runner


def get_health_vm(vm_name="VM1"):

    with open('../Resources/Config/nodes_config.json', 'r') as f:
        res_json = json.load(f)

    # Create a ClientSecretCredential instance
    credential = ClientSecretCredential(res_json["tenant_id"], res_json["client_id"], res_json["client_secret"])

    # Create a ComputeManagementClient instance
    compute_client = ComputeManagementClient(credential, res_json["subscription_id"])

    # Get the details of the VM
    vm = compute_client.virtual_machines.get(res_json["resource_group_name"], vm_name)

    # Get the CPU usage of the VM using psutil
    cpu_usage_percent = psutil.cpu_percent()

    # Get the memory usage of the VM using psutil
    memory_usage_percent = psutil.virtual_memory().percent

    # Get the disk usage of the VM using the Azure Compute Management Client
    disk_usage_percent = 0
    for disk in vm.storage_profile.data_disks:
        disk_instance_view = compute_client.disks.get(res_json["resource_group_name"], disk.name,
                                                      expand=InstanceViewTypes.instance_view).instance_view
        disk_status = [status for status in disk_instance_view.statuses if status.code.startswith('PowerState/')][0]
        if disk_status.display_status == 'Attached':
            for volume in disk_instance_view.volumes:
                if volume.status == InstanceViewStatus('Attached'):
                    disk_usage_percent += volume.disk_usage_percent

    # Print the resource utilization of the VM
    print(f"CPU usage: {cpu_usage_percent}%")
    print(f"Memory usage: {memory_usage_percent}%")
    print(f"Disk usage: {disk_usage_percent}%")


def get_all_nodes():
    query = "SELECT * FROM infra.nodes"
    res = sql_query_runner(query)
    nodes = res['node_name'].tolist()
    return nodes
