import os
from logging.config import dictConfig

import pymongo
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.logger import logger
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from db.database import db_clients
from exception.base_error import BaseError
from exception.ulca_api_key_client_error import ULCAApiKeyClientError
from exception.ulca_api_key_server_error import ULCAApiKeyServerError
from log.logger import LogConfig
from metrics import api_key_name_callback, inference_service_callback, user_id_callback
from middleware import PrometheusMetricsMiddleware
from module import *
from seq_streamer import StreamingServerTaskSequence

dictConfig(LogConfig().dict())

load_dotenv()

app = FastAPI(
    title="Dhruva API",
    description="Backend API for communicating with the Dhruva platform",
)

streamer = StreamingServerTaskSequence()
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
    PrometheusMetricsMiddleware,
    app_name="Dhruva",
    custom_labels={
        "inference_service": inference_service_callback,
        "api_key_name": api_key_name_callback,
        "user_id": user_id_callback,
    },
)


@app.on_event("startup")
async def load_prometheus():
    db_clients["app"] = pymongo.MongoClient(os.environ["APP_DB_CONNECTION_STRING"])
    db_clients["log"] = pymongo.MongoClient(os.environ["LOG_DB_CONNECTION_STRING"])


@app.exception_handler(ULCAApiKeyClientError)
async def ulca_api_key_client_error_handler(
    request: Request, exc: ULCAApiKeyClientError
):
    return JSONResponse(
        status_code=exc.error_code,
        content={
            "isRevoked": False,
            "message": exc.message,
        },
    )


@app.exception_handler(ULCAApiKeyServerError)
async def ulca_api_key_server_error_handler(
    request: Request, exc: ULCAApiKeyServerError
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


@app.on_event("startup")
async def startup_event():
    import datetime
    import json
    import os

    import pymongo
    from bson import ObjectId
    from dotenv import load_dotenv
    from redis_om.model.encoders import jsonable_encoder

    from module.auth.model.api_key import ApiKey, ApiKeyCache
    from module.services.model.model import Model, ModelCache
    from module.services.model.service import Service, ServiceCache

    load_dotenv()

    mongo_client = pymongo.MongoClient(os.environ["APP_DB_CONNECTION_STRING"])
    mongo_db = mongo_client["dhruva"]

    mongo_coll = mongo_db["user"]
    user = mongo_coll.find_one({"email": "dhruva@ai4bharat.org"})
    print(user, user["_id"])


    ServiceCache.db().flushall()

    print("Init model data")
    mongo_coll = mongo_db["model"]
    mongo_coll.delete_many({})
    with open("db/fixtures/models_registry.json") as sf:
        models = json.loads(sf.read())
        for sname, svalue in models.items():
            mongo_coll.insert_one(svalue)
            sc = ModelCache(**svalue)
            # print(sc)
            # print(ServiceCache.__fields__, sc)
            sc.save()
            print(sc)
    
    print("Init service data")
    mongo_coll = mongo_db["service"]
    mongo_coll.delete_many({})
    with open("db/fixtures/services_registry.json") as sf:
        services = json.loads(sf.read())
        for sname, svalue in services.items():
            mongo_coll.insert_one(svalue)
            sc = ServiceCache(**svalue)
            # print(sc)
            # print(ServiceCache.__fields__, sc)
            sc.save()
            print(sc)

    print("----\nInit api key data")
    d = datetime.datetime(2010, 1, 1)
    mongo_coll = mongo_db["api_key"]
    mongo_coll.delete_many({})
    # print(ApiKeyCache.__fields__)
    with open("db/fixtures/api_key_registry.json") as af:
        api_keys = json.loads(af.read())
        for avalue in api_keys:
            avalue.update({
                "masked_key": "key",
                "active": True,
                # "user_id": ObjectId("3ECB98B54EF5EA06732919C8"),
                "user_id": user["_id"],
                "type": "ADMIN",
                "usage": 0,
            })
            # print("avalue: ", avalue)
            mongo_coll.insert_one(avalue)
            # print(avalue, "\n", ApiKeyCache.__fields__)
            # print("avalue: ", avalue)
            ac = ApiKeyCache(**avalue)
            # print(ac.make_key(ac._meta.primary_key_pattern.format(pk="")))
            # res = ac.db().scan_iter(ac.make_key(ac._meta.primary_key_pattern.format(pk="")) + "*", _type="HASH")
            # for r in res:
            #     print(r)
            # break
            ac.save()
            print(ac)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=5050, log_level="info", workers=2)
