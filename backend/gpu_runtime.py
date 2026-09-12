"""CUDA device selection shared by the backend's CuPy workloads."""
import os

import numpy as np


try:
    import cupy as cp

    requested_index = int(os.getenv("MOSQUITO_GPU_INDEX", "0"))
    device_count = cp.cuda.runtime.getDeviceCount()
    if requested_index < 0 or requested_index >= device_count:
        raise RuntimeError(
            f"MOSQUITO_GPU_INDEX={requested_index} is unavailable; "
            f"CUDA exposes {device_count} device(s)."
        )

    cp.cuda.Device(requested_index).use()
    xp = cp
    GPU_ENABLED = True
    GPU_STATUS = {
        "enabled": True,
        "backend": "CuPy/CUDA",
        "index": requested_index,
        "name": cp.cuda.runtime.getDeviceProperties(requested_index)["name"].decode(),
        "device_count": device_count,
    }
except Exception as error:
    xp = np
    GPU_ENABLED = False
    GPU_STATUS = {
        "enabled": False,
        "backend": "NumPy/CPU",
        "reason": str(error),
    }
    


def get_gpu_status():
    print(GPU_STATUS)
    return dict(GPU_STATUS)