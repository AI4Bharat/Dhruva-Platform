import time
import uuid
from datetime import datetime
from typing import Callable, Dict, List, Optional, Union

from fastapi import Request
from fastapi.logger import logger
from prometheus_client import CollectorRegistry, Counter, Histogram
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
        self.app_name = app_name.lower()
        self.custom_labels = custom_labels

    async def dispatch(self, request: Request, call_next):
        begin = time.perf_counter()

        # process the request and get the response
        response = await call_next(request)

        labels = [
            request.method,
            request.url.components.path,
            int(response.status_code),
            self.app_name,
            uuid.uuid4(),
            *self._get_custom_labels_values(request),
        ]

        push_metrics.apply_async((labels, time.perf_counter() - begin,), queue="metrics_log")
        return response

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
