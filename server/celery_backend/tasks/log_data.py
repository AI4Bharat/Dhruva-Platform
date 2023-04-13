import json
import logging
import os
from datetime import datetime
from time import time

from ..celery_app import app
from .database import LogDatabase
from .metering import meter_usage


logs_db = None
LOG_REQUEST_RESPONSE_DATA_FLAG = os.environ.get("LOG_REQUEST_RESPONSE_DATA_FLAG", None)
if LOG_REQUEST_RESPONSE_DATA_FLAG:
    logs_db = LogDatabase()


def log_to_db(inp: str, output: str, api_key_id: str, service_id: str):
    """Log input output data pairs to the DB"""
    logs_collection = logs_db[service_id]
    log_document = {
        "input": inp,
        "output": output,
        "api_key_id": api_key_id,
        "timestamp": datetime.now().strftime("%d-%m-%Y, %H:%M:%S"),
    }
    logs_collection.insert_one(log_document)


@app.task(name="log.data")
def log_data(
    url: str, api_key_id: str, req_body: str, resp_body: str, response_time: time
) -> None:
    """Logs I/O and metering data to MongoDB"""

    print("url: ", url)
    usage_type, service_component = url.split("/")[-1].split("?")
    service_id = service_component.split("serviceId=")[-1].replace("%2F", "/")

    resp_body = json.loads(resp_body)
    req_body = json.loads(req_body)

    data_usage = None
    if usage_type == "tts":
        data_usage = req_body["input"]
    elif usage_type == "asr":
        data_usage = req_body["audio"]
    elif usage_type == "translation":
        data_usage = req_body["input"]
    else:
        raise ValueError(f"Invalid task type: {usage_type}")

    if LOG_REQUEST_RESPONSE_DATA_FLAG:
        log_to_db(req_body, resp_body, api_key_id, service_id)

    logging.debug(f"response_time: {response_time}")
    meter_usage(api_key_id, data_usage, usage_type, service_id)
