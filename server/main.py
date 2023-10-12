import os
from collections import OrderedDict
from logging.config import dictConfig

import pymongo
from cache.app_cache import get_cache_connection
from custom_metrics import *
from db.database import db_client
from db.metering_database import Base, engine
from db.populate_db import seed_collection
from dotenv import load_dotenv
from exception.base_error import BaseError
from exception.client_error import ClientError
from exception.ulca_delete_api_key_client_error import ULCADeleteApiKeyClientError
from exception.ulca_delete_api_key_server_error import ULCADeleteApiKeyServerError
from exception.ulca_set_api_key_tracking_client_error import (
    ULCASetApiKeyTrackingClientError,
)
from exception.ulca_set_api_key_tracking_server_error import (
    ULCASetApiKeyTrackingServerError,
)
from fastapi import FastAPI, Request
from fastapi.logger import logger
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi_sqlalchemy import DBSessionMiddleware
from log.logger import LogConfig
from middleware import PrometheusGlobalMetricsMiddleware
from module import *
from seq_streamer import StreamingServerTaskSequence

dictConfig(LogConfig().dict())

load_dotenv()

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

app.add_middleware(DBSessionMiddleware, custom_engine=engine)


@app.on_event("startup")
async def init_mongo_client():
    db_client["app"] = pymongo.MongoClient(os.environ["APP_DB_CONNECTION_STRING"])


@app.on_event("startup")
async def init_metering_db():
    Base.metadata.create_all(engine)


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


@app.exception_handler(ClientError)
async def client_error_handler(request: Request, exc: ClientError):
    if exc.log_exception:
        logger.error(exc)

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": {
                "message": f"{exc.message}",
            }
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
