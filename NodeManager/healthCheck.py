import json
from azure.identity import ClientSecretCredential
from azure.mgmt.compute import ComputeManagementClient
from azure.mgmt.compute.models import InstanceViewTypes, InstanceViewStatus
import psutil
from Utilities import sql_query_runner
import datetime
import time


class Node:
    def __init__(self, subscription_id, resource_group_name, vm_name, client_id, client_secret, tenant_id):
        self.subscription_id = subscription_id
        self.resource_group_name = resource_group_name
        self.vm_name = vm_name
        self.client_id = client_id
        self.client_secret = client_secret
        self.tenant_id = tenant_id

        credential = ClientSecretCredential(self.tenant_id, self.client_id, self.client_secret)
        self.compute_client = ComputeManagementClient(credential, self.subscription_id)

    def get_health(self):
        vm = self.compute_client.virtual_machines.get(self.resource_group_name, self.vm_name)

        # Get the CPU usage of the VM using psutil
        cpu_usage_percent = psutil.cpu_percent()

        # Get the memory usage of the VM using psutil
        memory_usage_percent = psutil.virtual_memory().percent

        # Get the disk usage of the VM using the Azure Compute Management Client
        disk_usage_percent = 0
        for disk in vm.storage_profile.data_disks:
            disk_instance_view = self.compute_client.disks.get(self.resource_group_name, disk.name,
                                                          expand=InstanceViewTypes.instance_view).instance_view
            disk_status = [status for status in disk_instance_view.statuses if status.code.startswith('PowerState/')][0]
            if disk_status.display_status == 'Attached':
                for volume in disk_instance_view.volumes:
                    if volume.status == InstanceViewStatus('Attached'):
                        disk_usage_percent += volume.disk_usage_percent

        health = ((100 - cpu_usage_percent) + (100 - memory_usage_percent) + (100 - disk_usage_percent)) / 3

        return cpu_usage_percent, memory_usage_percent, disk_usage_percent, health

    def monitor(self):
        cpu_usage, memory_usage, disk_usage, health = self.get_health()

        # log
        query = f"INSERT INTO infra.node_health_log (node_name, cpu_usage, memory_usage, disk_usage, health, added_on) " \
                f"VALUES ('{self.vm_name}', '{cpu_usage}', '{memory_usage}', '{disk_usage}', '{health}', '{datetime.datetime.now()}');"
        sql_query_runner(query)

        # Check for overload of resources
        threshold = 90
        if cpu_usage > threshold:
            print("Alert: CPU Usage above threshold")
        elif memory_usage > threshold:
            print("Alert: Memory Usage above threshold")
        elif disk_usage > threshold:
            print("Alert: Disk Usage above threshold")


def get_all_nodes():
    query = "SELECT * FROM infra.nodes"
    res = sql_query_runner(query)
    node_names = res['node_name'].tolist()
    return node_names


def get_node_health():
    with open('../Resources/Config/nodes_config.json', 'r') as f:
        res_json = json.load(f)

    vm_names = get_all_nodes()
    nodes_health = dict()

    for i in range(len(vm_names)):
        node = Node(res_json["subscription_id"], res_json["resource_group_name"], vm_names[i], res_json["client_id"],
                      res_json["client_secret"], res_json["tenant_id"])
        cpu_usage, memory_usage, disk_usage, health = node.get_health()
        nodes_health[vm_names[i]] = health
        print(f"Resource Utilization for Node {vm_names[i]}:")
        print(f"CPU usage: {cpu_usage}%")
        print(f"Memory usage: {memory_usage}%")
        print(f"Disk usage: {disk_usage}%\n")
        print(f"Node {vm_names[i]} Health: {health}%\n")

    max_health_node = max(nodes_health, key=lambda x:nodes_health[x])
    print(f"Node {max_health_node} has maximum health of {nodes_health[max_health_node]}%")


def monitor_nodes():
    with open('../Resources/Config/nodes_config.json', 'r') as f:
        res_json = json.load(f)

    vm_names = get_all_nodes()

    for i in range(len(vm_names)):
        node = Node(res_json["subscription_id"], res_json["resource_group_name"], vm_names[i], res_json["client_id"],
                      res_json["client_secret"], res_json["tenant_id"])
        node.monitor()
