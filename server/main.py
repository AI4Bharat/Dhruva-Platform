import os
from collections import OrderedDict
from logging.config import dictConfig

import pymongo
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.logger import logger
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from cache.app_cache import get_cache_connection
from db.database import db_clients
from db.populate_db import seed_collection
from exception.base_error import BaseError
from exception.ulca_delete_api_key_client_error import ULCADeleteApiKeyClientError
from exception.ulca_delete_api_key_server_error import ULCADeleteApiKeyServerError
from exception.ulca_set_api_key_tracking_client_error import (
    ULCASetApiKeyTrackingClientError,
)
from exception.ulca_set_api_key_tracking_server_error import (
    ULCASetApiKeyTrackingServerError,
)
from log.logger import LogConfig
from custom_metrics import *
from middleware import PrometheusGlobalMetricsMiddleware
from module import *
from seq_streamer import StreamingServerTaskSequence

dictConfig(LogConfig().dict())

load_dotenv(override=True)

app = FastAPI(
    title="Dhruva API",
    description="Backend API for communicating with the Dhruva platform",
)

streamer = StreamingServerTaskSequence(
    max_connections=int(os.environ.get("MAX_SOCKET_CONNECTIONS_PER_WORKER", -1))
)
app.mount("/socket.io", streamer.app)

# TODO: Depreciate this soon in-favor of above
from asr_streamer import StreamingServerASR

streamer_asr = StreamingServerASR()

# Mount it at an alternative path.
app.mount("/socket_asr.io", streamer_asr.app)

app.include_router(ServicesApiRouter)
app.include_router(AuthApiRouter)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    # allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    PrometheusGlobalMetricsMiddleware,
    app_name="Dhruva",
    registry=registry,
    custom_labels=["api_key_name", "user_id"],
    custom_metrics=[INFERENCE_REQUEST_COUNT, INFERENCE_REQUEST_DURATION_SECONDS],
)


@app.on_event("startup")
async def init_mongo_client():
    db_clients["app"] = pymongo.MongoClient(os.environ["APP_DB_CONNECTION_STRING"])
    db_clients["log"] = pymongo.MongoClient(os.environ["LOG_DB_CONNECTION_STRING"])


@app.on_event("startup")
async def flush_cache():
    cache = get_cache_connection()
    cache.flushall()


@app.exception_handler(ULCASetApiKeyTrackingClientError)
async def ulca_set_api_key_tracking_client_error_handler(
    request: Request, exc: ULCASetApiKeyTrackingClientError
):
    return JSONResponse(
        status_code=exc.error_code,
        content={
            "status": "failure",
            "message": exc.message,
        },
    )


@app.exception_handler(ULCASetApiKeyTrackingServerError)
async def ulca_set_api_key_tracking_server_error_handler(
    request: Request, exc: ULCASetApiKeyTrackingServerError
):
    logger.error(exc)

    return JSONResponse(
        status_code=500,
        content={
            "status": "failure",
            "message": exc.error_kind + " - Internal Server Error",
        },
    )


@app.exception_handler(ULCADeleteApiKeyClientError)
async def ulca_delete_api_key_client_error_handler(
    request: Request, exc: ULCADeleteApiKeyClientError
):
    return JSONResponse(
        status_code=exc.error_code,
        content={
            "isRevoked": False,
            "message": exc.message,
        },
    )


@app.exception_handler(ULCADeleteApiKeyServerError)
async def ulca_delete_api_key_server_error_handler(
    request: Request, exc: ULCADeleteApiKeyServerError
):
    logger.error(exc)

    return JSONResponse(
        status_code=500,
        content={
            "isRevoked": False,
            "message": exc.error_kind + " - Internal Server Error",
        },
    )


@app.exception_handler(BaseError)
async def base_error_handler(request: Request, exc: BaseError):
    logger.error(exc)

    return JSONResponse(
        status_code=500,
        content={
            "detail": {
                "kind": exc.error_kind,
                "message": f"Request failed. Please try again.",
            }
        },
    )


@app.get("/")
def read_root():
    return "Welcome to Dhruva API!"


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=5050, log_level="info", workers=2)
