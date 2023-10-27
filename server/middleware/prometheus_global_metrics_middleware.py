import time

# from datetime import datetime
from typing import Any, Dict, List, Optional

import jsonpickle
from celery_backend.tasks import push_metrics
from fastapi import Request
from fastapi.logger import logger
from prometheus_client import CollectorRegistry, Counter, Histogram
from starlette.middleware.base import BaseHTTPMiddleware


class PrometheusGlobalMetricsMiddleware(BaseHTTPMiddleware):
    """
    Provides default global metrics for each request

    To create more custom labels, store the value of the label in the
    requests state, and add the labelname to the custom labels list
    in the middleware init params.
    """

    def __init__(
        self,
        app,
        app_name: str,
        registry: CollectorRegistry,
        custom_labels: List[str] = [],
        custom_metrics: List[Any] = [],
    ):
        super().__init__(app)
        self.app_name = app_name.lower()
        self.registry = registry
        self.custom_labels = custom_labels
        self.custom_metrics = custom_metrics

    async def dispatch(self, request: Request, call_next):
        begin = time.perf_counter()

        # process the request and get the response
        response = await call_next(request)

        labels = [
            request.method,
            request.url.components.path,
            int(response.status_code),
            self.app_name,
            *self._get_custom_labels_values(request),
        ]

        self.request_count.labels(*labels).inc()
        end = time.perf_counter()
        self.request_duration_seconds.labels(*labels).observe(end - begin)

        push_metrics.apply_async(
            (jsonpickle.encode(self.registry, keys=True),), queue="metrics-log"
        )

        self.request_count.clear()
        self.request_duration_seconds.clear()

        for metric in self.custom_metrics:
            metric.clear()

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
                    *self._get_custom_labels(),
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
                    *self._get_custom_labels(),
                ),
            )

            self.__setattr__(key, metric)

        return metric

    def _get_custom_labels(self):
        if self.custom_labels is None:
            return []

        return self.custom_labels

    def _get_custom_labels_values(self, request: Request):
        if self.custom_labels is None:
            return []

        values: List[Optional[str]] = [
            request.state._state.get(label) for label in self.custom_labels
        ]

        return values
