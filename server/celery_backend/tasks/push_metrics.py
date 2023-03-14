import os
from typing import Callable, Dict, List, Optional, Union

from dotenv import load_dotenv
from prometheus_client import CollectorRegistry, Counter, Histogram, push_to_gateway

from ..celery_app import app
from .database import LogDatabase
from constants import APP_NAME
from metrics import CUSTOM_LABELS

logs_db = LogDatabase()

load_dotenv()


class PrometheusMetrics():
    def __init__(
        self,
        app_name: str,
        custom_labels: Optional[Dict[str, Union[str, Callable]]] = None,
    ):
        self.registry = CollectorRegistry()
        self.app_name = app_name.lower()
        self.custom_labels = custom_labels

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


prometheus_metrics = PrometheusMetrics(
    app_name=APP_NAME,
    custom_labels=CUSTOM_LABELS
)


@app.task(name="push.metrics")
def push_metrics(labels: List, response_time: float) -> None:
    """Logs metrics to Prometheus using the push method"""

    prometheus_metrics.request_count.labels(*labels).inc()
    prometheus_metrics.request_duration_seconds.labels(*labels).observe(response_time)

    push_to_gateway(os.environ["PROMETHEUS_URL"], job="metrics_push", registry=prometheus_metrics.registry)
