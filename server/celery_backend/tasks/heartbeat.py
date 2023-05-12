import json
import logging
import os
import traceback
from typing import Any, Dict, List

import requests

from ..celery_app import app

API_KEY = os.environ.get("HEARTBEAT_API_KEY")
BASE_URL = os.environ.get("NEXT_PUBLIC_BACKEND_API_URL")

HEADERS = {"Authorization": str(API_KEY), "x-auth-source": "API_KEY"}

logger = logging.getLogger(__name__)


def set_health_status(service_id: str, status: str):
    try:
        res = requests.patch(
            f"{BASE_URL}/services/admin/health",
            headers=HEADERS,
            json={"serviceId": service_id, "status": status},
        )
    except Exception as e:
        print(f"Failed to update {service_id} service health with error: ", e)
        traceback.print_exc()

    if res.status_code != 200:
        print(
            f"Failed to update {service_id} service health with status code: ",
            res.status_code,
        )


def send_heartbeat(services: List[Dict[str, Any]], models: Dict[str, Any]):
    success = 0
    failure = 0

    for service in services:
        try:
            body = models[service["modelId"]]["inferenceEndPoint"]["schema"]["request"]
            body["config"]["serviceId"] = service["serviceId"]

            response = requests.post(
                f"{BASE_URL}/services/inference/{service['task']['type']}?serviceId={service['serviceId']}",
                headers=HEADERS,
                json=body,
            )

            if response.status_code == 200:
                success += 1
                set_health_status(service["serviceId"], "healthy")

            else:
                raise Exception(
                    f"Service {service['serviceId']} failed with status code {response.status_code}. The error was {response.json()}"
                )
        except Exception as e:
            print(e)
            traceback.print_exc()

            failure += 1
            set_health_status(service["serviceId"], "unhealthy")

    return (success, failure)


@app.task(name="heartbeat", queue="heartbeat")
def inference_heartbeat():
    fetch_list_success = True

    services = requests.get(
        f"{BASE_URL}/services/details/list_services", headers=HEADERS
    )
    if services.status_code != 200:
        fetch_list_success = False
        print(f"Failed to fetch service list. Status code: {services.status_code}")

    models = requests.get(f"{BASE_URL}/services/details/list_models", headers=HEADERS)
    if models.status_code != 200:
        fetch_list_success = False
        print(f"Failed to fetch model list. Status code: {models.status_code}")

    services = services.json()
    models = models.json()
    model_dict = {}

    # transforming models structure for easier access
    for model in models:
        model_dict[model["modelId"]] = model

    if fetch_list_success:
        status = send_heartbeat(services, model_dict)
        print(f"Success: {status[0]}, Failure: {status[1]}")
