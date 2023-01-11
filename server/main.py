from typing import Union, Callable
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from prometheus_fastapi_instrumentator.metrics import Info
from prometheus_client import Counter

from services import *

app = FastAPI(
    title="Dhruva API",
    description="Backend API for communicating with the Dhruva platform",
)
app.include_router(services_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    # allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def http_body_language() -> Callable[[Info], None]:
    METRIC = Counter(
        "http_body_language", "Number of times a certain language has been requested.", labelnames=("langs",)
    )

    def instrumentation(info: Info) -> None:
        lang_str = info.request.body['langs']
        METRIC.labels(langs=lang_str).inc()

    return instrumentation


@app.on_event("startup")
async def startup():
    Instrumentator().instrument(app).add(http_body_language()).expose(app)


@app.get("/")
def read_root():
    return "Welcome to Dhruva API!"
