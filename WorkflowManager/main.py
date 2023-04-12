import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from ServerlifecycleManager.update_vm import update_vm

print(update_vm("VM1"))
