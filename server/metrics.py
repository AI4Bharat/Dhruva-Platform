from fastapi import Request


def inference_service_callback(req: Request):
    return req.query_params.get("serviceId", None)


def api_key_name_callback(req: Request):
    return req.state._state.get("api_key_name")


def user_id_callback(req: Request):
    return req.state._state.get("user_id")
