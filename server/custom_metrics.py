from prometheus_client import CollectorRegistry, Counter, Histogram

registry = CollectorRegistry()

INFERENCE_REQUEST_COUNT = Counter(
    "dhruva_inference_request_total",
    "Total requests made to inference services",
    registry=registry,
    labelnames=(
        "api_key_name",
        "user_id",
        "inference_service",
        "task_type",
        "source_language",
        "target_language",
    ),
)

INFERENCE_REQUEST_DURATION_SECONDS = Histogram(
    "dhruva_inference_request_duration_seconds",
    "Inference Request Duration Seconds",
    registry=registry,
    labelnames=(
        "api_key_name",
        "user_id",
        "inference_service",
        "task_type",
        "source_language",
        "target_language",
    ),
)
