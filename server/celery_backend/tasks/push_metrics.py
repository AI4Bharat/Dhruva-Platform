import os
from time import time

import jsonpickle
from dotenv import load_dotenv
from prometheus_client import CollectorRegistry, push_to_gateway
from prometheus_client.exposition import basic_auth_handler

from ..celery_app import app

load_dotenv()


def prom_agg_gateway_auth_handler(url, method, timeout, headers, data):
    try:
        username = os.environ["PROM_AGG_GATEWAY_USERNAME"]
        password = os.environ["PROM_AGG_GATEWAY_PASSWORD"]
        return basic_auth_handler(
            url, method, timeout, headers, data, username, password
        )
    except Exception:
        return None


@app.task(name="push.metrics")
def push_metrics(registry_enc: str) -> None:
    """Logs metrics to Prometheus using the push method"""
    registry: CollectorRegistry = jsonpickle.decode(registry_enc, keys=True)  # type: ignore
    push_to_gateway(
        os.environ["PROMETHEUS_URL"],
        job="metrics_push",
        registry=registry,
        handler=prom_agg_gateway_auth_handler,
    )
