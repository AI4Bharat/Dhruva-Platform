from prometheus_client import Counter, Histogram

INFERENCE_REQUEST_COUNT = Counter(
    "inference_request_count",
    "Total requests made to inference services",
    [
        "api_key_name",
        "user_id",
        "inference_service_id",
        "task_type",
        "source_language",
    ],
)

INFERENCE_REQUEST_DURATION_SECONDS = Histogram(
    "inference_request_duration_seconds",
    "Inference Request Duration Seconds",
    [
        "api_key_name",
        "user_id",
        "inference_service_id",
        "task_type",
        "source_language",
    ],
)
