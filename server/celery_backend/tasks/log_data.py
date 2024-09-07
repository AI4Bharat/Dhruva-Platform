import base64
import io
import json
import logging
import os
import time
from datetime import datetime
from urllib.request import urlopen

from ulid import ULID

from ..celery_app import app
from . import constants
from .database import LogDatastore
from .metering import meter_usage

log_store = LogDatastore()


def log_to_storage(
    client_ip: str,
    error_msg: str,
    input_data: dict,
    output_data: dict,
    api_key_id: str,
    service_id: str,
):
    """Log input output data pairs to the DB"""

    inp, op = input_data, output_data
    if output_data.get("taskType") == "asr":
        inp = (
            [o["audioContent"] for o in input_data.get("audio")]
            if input_data and input_data.get("audio")
            else None
        )
        op = (
            [o["source"] for o in output_data.get("output")]
            if output_data and output_data.get("output")
            else None
        )
    elif (
        output_data.get("taskType") == "translation"
        or output_data.get("taskType") == "transliteration"
    ):
        inp = (
            [o["source"] for o in output_data.get("output")]
            if output_data and output_data.get("output")
            else None
        )
        op = (
            [o["target"] for o in output_data.get("output")]
            if output_data and output_data.get("output")
            else None
        )
    elif output_data.get("taskType") == "tts":
        inp = (
            [o["source"] for o in input_data.get("input")]
            if input_data and input_data.get("input")
            else None
        )
        op = (
            [o["audioContent"] for o in output_data.get("audio")]
            if output_data and output_data.get("audio")
            else None
        )

    domain = input_data.get("config", {}).get("domain")

    log_document = {
        "client_ip": client_ip,
        "source_language": input_data.get("config", {})
        .get("language", {})
        .get("sourceLanguage"),
        "target_language": input_data.get("config", {})
        .get("language", {})
        .get("targetLanguage"),
        "input": inp,
        "task_type": output_data.get("taskType"),
        "domain": domain,
        "output": op,
        "api_key_id": api_key_id,
        "service_id": service_id,
        "timestamp": datetime.now().strftime("%d-%m-%Y,%H:%M:%S"),
    }

    # Create a file in the local data directory to upload and download
    local_file_name = str(ULID.from_timestamp(time.time())) + ".json"

    # Create a blob client using the local file name as the name for the blob
    container_name = constants.LOGS_CONTAINER
    if error_msg:
        log_document["error_msg"] = error_msg
        container_name = constants.ERROR_CONTAINER

    # Write text to the file
    blob_stream = io.BytesIO()
    blob_stream.write(json.dumps(log_document, indent=4).encode("utf-8"))
    blob_stream.seek(0)

    # Files are stored based on the date
    blob_path = os.path.join(datetime.now().strftime("%Y/%m/%d"), local_file_name)
    blob_client = log_store.get_blob_client(container=container_name, blob=blob_path)
    print("\nUploading to Azure Storage as blob:\n\t" + local_file_name)

    # Upload the created file
    t = time.time()
    blob_client.upload_blob(blob_stream.read())
    print(f"Upload time: {time.time() - t}")


@app.task(name="log.data")
def log_data(
    usage_type: str,
    service_id: str,
    client_ip: str,
    data_tracking_consent: bool,
    error_msg,
    api_key_id: str,
    req_body: str,
    resp_body: str,
    response_time: time.time,
) -> None:
    """Logs I/O and metering data to MongoDB"""

    resp_body = json.loads(resp_body) if resp_body else {}
    req_body = json.loads(req_body)

    data_usage = None

    if usage_type in ("translation", "transliteration", "tts"):
        data_usage = req_body["input"]

    elif usage_type == "asr":
        for i, ele in enumerate(req_body["audio"]):
            if ele.get("audioUri"):
                req_body["audio"][i]["audioContent"] = base64.b64encode(
                    urlopen(ele["audioUri"]).read()
                ).decode("utf-8")
        data_usage = req_body["audio"]

    else:
        raise ValueError(f"Invalid task type: {usage_type}")

    if data_tracking_consent:
        log_to_storage(
            client_ip, error_msg, req_body, resp_body, api_key_id, service_id
        )

    logging.debug(f"response_time: {response_time}")
    meter_usage(api_key_id, data_usage, usage_type, service_id)
