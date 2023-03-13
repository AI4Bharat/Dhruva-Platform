import os
import time
import uuid
from datetime import datetime
from typing import Callable, Dict, List, Optional, Union

from fastapi import Request
from fastapi.logger import logger
from prometheus_client import (
    CollectorRegistry,
    Counter,
    Gauge,
    Histogram,
    push_to_gateway,
)
from starlette.middleware.base import BaseHTTPMiddleware

from celery_backend.tasks import push_metrics


class PrometheusMetricsMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app,
        app_name: str,
        custom_labels: Optional[Dict[str, Union[str, Callable]]] = None,
    ):
        super().__init__(app)
        self.registry = CollectorRegistry()
        self.app_name = app_name.lower()
        self.custom_labels = custom_labels
        self.instance_id = uuid.uuid4()

    async def dispatch(self, request: Request, call_next):
        begin = time.perf_counter()

        # do something with the request object, for example
        content_type = request.headers.get("Content-Type")

        # process the request and get the response
        response = await call_next(request)

        labels = [
            request.method,
            request.url.components.path,
            int(response.status_code),
            self.app_name,
            self.instance_id,
            uuid.uuid4(),
            *self._get_custom_labels_values(request),
        ]

        self.request_count.labels(*labels).inc()
        end = time.perf_counter()
        self.request_duration_seconds.labels(*labels).observe(end - begin)

        push_metrics.apply_async((self.registry,), queue="metrics_log")

        return response

    @property
    def request_count(self):
        unit = "requests_total"
        metric_name = f"{self.app_name}_{unit}"
        key = f"{unit}_counter"

        try:
            metric = self.__getattribute__(key)
        except Exception:
            metric = Counter(
                metric_name,
                "Total HTTP requests",
                registry=self.registry,
                labelnames=(
                    "method",
                    "path",
                    "status_code",
                    "app_name",
                    "instance_id",
                    "request_id",
                    *self._get_custom_labels_keys(),
                ),
            )

            self.__setattr__(key, metric)

        return metric

    @property
    def request_duration_seconds(self):
        unit = "request_duration_seconds"
        metric_name = f"{self.app_name}_{unit}"
        key = f"{unit}_histogram"

        try:
            metric = self.__getattribute__(key)
        except Exception:
            metric = Histogram(
                metric_name,
                "Request duration seconds",
                registry=self.registry,
                labelnames=(
                    "method",
                    "path",
                    "status_code",
                    "app_name",
                    "instance_id",
                    "request_id",
                    *self._get_custom_labels_keys(),
                ),
            )

            self.__setattr__(key, metric)

        return metric

    def _get_custom_labels_keys(self):
        if self.custom_labels is None:
            return []

        return list(self.custom_labels.keys())

    def _get_custom_labels_values(self, request: Request):
        if self.custom_labels is None:
            return []

        values: List[str] = []

        for k, v in self.custom_labels.items():
            if callable(v):
                parsed_value = ""
                # if provided a callable, try to use it on the request.
                try:
                    result = v(request)
                except Exception:
                    logger.warn(f"label function for {k} failed", exc_info=True)
                else:
                    parsed_value = str(result)
                values.append(parsed_value)
                continue

            values.append(v)

        return values
