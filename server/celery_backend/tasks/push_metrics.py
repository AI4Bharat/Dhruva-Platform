import os
from time import time

import jsonpickle
from dotenv import load_dotenv
from prometheus_client import CollectorRegistry, push_to_gateway

from ..celery_app import app
from .database import LogDatabase

logs_db = LogDatabase()

load_dotenv()


@app.task(name="push.metrics")
def push_metrics(registry_enc: str) -> None:
    """Logs metrics to Prometheus using the push method"""
    registry: CollectorRegistry = jsonpickle.decode(registry_enc, keys=True)  # type: ignore
    push_to_gateway(
        os.environ["PROMETHEUS_URL"],
        job="metrics_push",
        registry=registry,
    )
