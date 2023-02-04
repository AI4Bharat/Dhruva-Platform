from fastapi import Request


def inference_service_callback(req: Request):
    return req.query_params.get("serviceId", None)