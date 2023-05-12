import json
import logging
import os
import traceback

import requests

from ..celery_app import app

API_KEY = os.environ.get("HEARTBEAT_API_KEY")
BASE_URL = os.environ.get("NEXT_PUBLIC_BACKEND_API_URL")

HEADERS = {"Authorization": str(API_KEY), "x-auth-source": "API_KEY"}

logger = logging.getLogger(__name__)


@app.task(name="heartbeat", queue="heartbeat")
def inference_heatbeat():
    services = requests.get(
        f"{BASE_URL}/services/details/list_services", headers=HEADERS
    )
    if services.status_code != 200:
        print(f"Failed to fetch service list. Status code: {services.status_code}")

    models = requests.get(f"{BASE_URL}/services/details/list_models", headers=HEADERS)
    if models.status_code != 200:
        print(f"Failed to fetch model list. Status code: {models.status_code}")

    success = 0
    failure = 0
    services = services.json()
    models = models.json()
    model_dict = {}
    for model in models:
        model_dict[model["modelId"]] = model
    for service in services:
        try:
            body = model_dict[service["modelId"]]["inferenceEndPoint"]["schema"][
                "request"
            ]
            body["config"]["serviceId"] = service["serviceId"]
            # print(f"{BASE_URL}/services/inference/{service['task']['type']}")
            response = requests.post(
                f"{BASE_URL}/services/inference/{service['task']['type']}?serviceId={service['serviceId']}",
                headers=HEADERS,
                json=body,
            )
            if response.status_code == 200:
                success += 1
                try:
                    requests.patch(
                        f"{BASE_URL}/services/admin/health",
                        headers=HEADERS,
                        json={"serviceId": service["serviceId"], "status": "healthy"},
                    )
                except Exception as e:
                    print("Failed to update service health with error: ", e)
            else:
                raise Exception(
                    f"Service {service['serviceId']} failed with status code {response.status_code}. The error was {response.json()}"
                )
        except Exception as e:
            failure += 1
            requests.patch(
                f"{BASE_URL}/services/admin/health",
                headers=HEADERS,
                json={"serviceId": service["serviceId"], "status": "unhealthy"},
            )

            print(e)
            traceback.print_exc()

            continue
    print(f"Success: {success}, Failure: {failure}")
