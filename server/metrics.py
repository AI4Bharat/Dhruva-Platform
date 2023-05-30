import json
from typing import Any, Dict

from fastapi import Request


def inference_service_callback(req: Request):
    return req.query_params.get("serviceId", None)


def api_key_name_callback(req: Request):
    return req.state._state.get("api_key_name")


def user_id_callback(req: Request):
    return req.state._state.get("user_id")


def task_type_callback(req: Request):
    if "inference" in req.url.path:
        return req.url.path.split("/")[-1]

    return None


async def language_callback(req: Request):
    if "inference" not in req.url.path:
        return None
    try:
        req_body_bytes = await req.body()
        req_body = req_body_bytes.decode("utf-8")
        req_json: Dict[str, Any] = json.loads(req_body)
        return req_json["config"]["language"]["sourceLanguage"]
    except Exception:
        return None
